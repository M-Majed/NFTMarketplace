// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("NFTModule", (m) => {
  // 1) Base URI for your NFT metadata (adjust as needed)
  const baseURI = m.getParameter("baseURI", "ipfs://YOUR_DEFAULT_CID/");

  // 2) Deploy your NFT contract
  const myNFT = m.contract("MyNFT", [baseURI]);

  // 3) Deploy your Marketplace contract
  const marketplace = m.contract("NFTMarketplace", []);

  // 4) Grant marketplace permission to transfer NFTs on behalf of users
  m.call("Approve marketplace", {
    contract: myNFT,
    fn: "setApprovalForAll",
    args: [marketplace.target, true],
    from: m.deployer,
  });

  return { myNFT, marketplace };
});
