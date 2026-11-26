require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const AMOY_RPC_URL = process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  networks: {
    localhost: { url: "http://127.0.0.1:8545" },
    // Polygon Amoy testnet (only active if PRIVATE_KEY is set in .env)
    ...(PRIVATE_KEY
      ? { amoy: { url: AMOY_RPC_URL, accounts: [PRIVATE_KEY], chainId: 80002 } }
      : {}),
  },
};
