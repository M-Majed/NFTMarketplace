// scripts/deploy.cjs
const hre = require("hardhat");

async function main() {
  // Compile if needed
  await hre.run("compile");

  // Get the factory and deploy
  const Factory    = await hre.ethers.getContractFactory("NFTMarketplace");
  const contract   = await Factory.deploy();

  // Ethers v6: waitForDeployment, v5: deployed()
  if (typeof contract.waitForDeployment === "function") {
    await contract.waitForDeployment();
  } else {
    await contract.deployed();
  }

  // Ethers v6: getAddress(), v5: address
  const deployedAddress = typeof contract.getAddress === "function"
    ? await contract.getAddress()
    : contract.address;

  console.log("NFTMarketplace deployed to:", deployedAddress);
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("Deployment failed:", err);
    process.exit(1);
  });
