// scripts/deploy.cjs
const hre = require("hardhat");

async function main() {
  await hre.run("compile");

  // Get the factory and deploy
  const Factory    = await hre.ethers.getContractFactory("Marketplace");
  const contract   = await Factory.deploy();
  await contract.waitForDeployment();
  const deployedAddress = await contract.getAddress();

  const Factory2    = await hre.ethers.getContractFactory("NFT");
  const contract2   = await Factory2.deploy();
  await contract2.waitForDeployment();
  const deployedAddress2 = await contract2.getAddress();

  console.log("Marketplace deployed to:", deployedAddress);
  console.log("NFT deployed to:", deployedAddress2);
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("Deployment failed:", err);
    process.exit(1);
  });
