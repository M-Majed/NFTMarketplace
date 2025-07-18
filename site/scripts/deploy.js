// scripts/deploy.js
const hre = require("hardhat");
const { ethers } = hre;  // pull ethers from Hardhat

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  // 1) Deploy MyNFT
  const MyNFT = await ethers.getContractFactory("MyNFT");
  const myNft = await MyNFT.deploy("ipfs://your-base-uri/");
  await myNft.waitForDeployment();            // <-- v6 style
  console.log("MyNFT ➡", myNft.target || myNft.address);

  // 2) Deploy NFTMarketplace
  const Marketplace = await ethers.getContractFactory("NFTMarketplace");
  const marketplace = await Marketplace.deploy();
  await marketplace.waitForDeployment();      // <-- v6 style
  console.log("Marketplace ➡", marketplace.target || marketplace.address);

  // 3) Approve marketplace to move NFTs on your behalf
  await myNft.connect(deployer).setApprovalForAll(marketplace.target || marketplace.address, true);
  console.log("✅ Marketplace approved");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
