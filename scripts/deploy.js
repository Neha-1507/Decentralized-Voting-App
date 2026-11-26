const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const Voting = await hre.ethers.getContractFactory("Voting");
  const voting = await Voting.deploy();
  await voting.waitForDeployment();
  const address = await voting.getAddress();
  console.log("Voting deployed to:", address);

  // Save address for the frontend
  const out = path.join(__dirname, "..", "frontend", "src", "deployment.json");
  fs.writeFileSync(out, JSON.stringify({ address, network: hre.network.name }, null, 2));
  console.log("Saved address to frontend/src/deployment.json");
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
