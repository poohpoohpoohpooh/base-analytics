// @ts-nocheck
const { ethers, network } = require("hardhat");

async function main() {
  const BaseIdentityActions = await ethers.getContractFactory(
    "BaseIdentityActions"
  );
  const contract = await BaseIdentityActions.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log("BaseIdentityActions deployed");
  console.log("Network:", network.name);
  console.log("Address:", address);
  console.log("");
  console.log("Add this to .env.local:");
  console.log(`NEXT_PUBLIC_BASE_IDENTITY_ACTIONS_ADDRESS=${address}`);
  console.log(
    `NEXT_PUBLIC_CHAIN_ID=${network.name === "baseSepolia" ? 84532 : 8453}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
