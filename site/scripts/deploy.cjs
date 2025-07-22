// scripts/deploy.cjs
const hre = require("hardhat");

async function main() {
  // 1. Compile if needed
  await hre.run("compile");

  // 2. Get the factory and deploy
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const marketplace    = await NFTMarketplace.deploy();

  // 3. Wait for on‐chain deployment
  await marketplace.waitForDeployment();

  // 4. Print the address
  const address = marketplace.getAddress
    ? await marketplace.getAddress()
    : marketplace.address;
  console.log("NFTMarketplace deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
