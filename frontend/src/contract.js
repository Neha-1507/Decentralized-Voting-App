import { BrowserProvider, Contract } from "ethers";
import deployment from "./deployment.json";

// Human-readable ABI (must match contracts/Voting.sol)
export const ABI = [
  "function admin() view returns (address)",
  "function electionCount() view returns (uint256)",
  "function isRegistered(uint256,address) view returns (bool)",
  "function hasVoted(uint256,address) view returns (bool)",
  "function createElection(string title, uint64 startTime, uint64 endTime) returns (uint256)",
  "function addCandidate(uint256 electionId, string name)",
  "function registerVoters(uint256 electionId, address[] voters)",
  "function vote(uint256 electionId, uint256 candidateIndex)",
  "function getElection(uint256 electionId) view returns (string title, uint64 startTime, uint64 endTime, uint8 status, uint256 candidateCount)",
  "function getCandidates(uint256 electionId) view returns (tuple(string name, uint256 voteCount)[])",
];

export const CONTRACT_ADDRESS = deployment.address;

export async function connectWallet() {
  if (!window.ethereum) throw new Error("MetaMask not found. Please install MetaMask.");
  if (!CONTRACT_ADDRESS) throw new Error("Contract not deployed yet. Run: npm run deploy:local");
  const provider = new BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const account = await signer.getAddress();
  const contract = new Contract(CONTRACT_ADDRESS, ABI, signer);
  return { provider, signer, account, contract };
}
