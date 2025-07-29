// scripts/deploy.cjs
const hre = require("hardhat");

async function main() {
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const nftMarketplace = await NFTMarketplace.deploy();
  await nftMarketplace.waitForDeployment();
  const myContractDeployedAddress = await nftMarketplace.getAddress();

  console.log("NFTMarketplace deployed to:", myContractDeployedAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
