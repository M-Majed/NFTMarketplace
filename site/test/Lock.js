// test/Lock.js
const { ethers } = require("hardhat");
const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("MyNFT & NFTMarketplace", function () {
  // Deploy MyNFT and NFTMarketplace, then have the seller approve the marketplace
  async function deployNFTFixture() {
    const [deployer, seller, buyer] = await ethers.getSigners();

    // 1) Deploy MyNFT
    const MyNFT = await ethers.getContractFactory("MyNFT");
    const myNFT = await MyNFT.deploy("ipfs://metadata/");
    await myNFT.waitForDeployment();

    // 2) Deploy NFTMarketplace
    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
    const marketplace = await NFTMarketplace.deploy();
    await marketplace.waitForDeployment();

    // 3) Seller approves marketplace to transfer their NFTs
    await myNFT.connect(seller).setApprovalForAll(marketplace.target, true);

    return { myNFT, marketplace, deployer, seller, buyer };
  }

  describe("MyNFT (ERC‑721)", function () {
    it("Allows owner to mint and sets correct tokenURI", async function () {
      const { myNFT, seller } = await loadFixture(deployNFTFixture);

      // Mint token #1 to the seller
      await myNFT.mint(seller.address);

      // Check ownership
      expect(await myNFT.ownerOf(1)).to.equal(seller.address);

      // Check tokenURI is baseURI + tokenId
      expect(await myNFT.tokenURI(1)).to.equal("ipfs://metadata/1");
    });
  });

  describe("NFTMarketplace", function () {
    it("Should let a user list and another buy an NFT", async function () {
      const { myNFT, marketplace, seller, buyer } = await loadFixture(deployNFTFixture);

      // Mint and list token #1
      await myNFT.mint(seller.address);
      const price = ethers.parseEther("1"); // BigInt
      await marketplace.connect(seller).listItem(myNFT.target, 1, price);

      // Buyer purchases, balances should update
      await expect(
        marketplace.connect(buyer).buyItem(myNFT.target, 1, { value: price })
      ).to.changeEtherBalances(
        [seller, buyer],
        [price, -price]
      );

      // Ownership transferred
      expect(await myNFT.ownerOf(1)).to.equal(buyer.address);
    });

    it("Should allow a seller to cancel their listing", async function () {
      const { myNFT, marketplace, seller } = await loadFixture(deployNFTFixture);

      // Mint and list token #1
      await myNFT.mint(seller.address);
      const price = ethers.parseEther("1");
      await marketplace.connect(seller).listItem(myNFT.target, 1, price);

      // Cancel listing and expect event
      await expect(
        marketplace.connect(seller).cancelListing(myNFT.target, 1)
      )
        .to.emit(marketplace, "Cancelled")
        .withArgs(myNFT.target, 1, seller.address);
    });
  });
});
