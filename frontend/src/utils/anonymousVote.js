import { ethers } from "ethers";

export function generateVoteSecret() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return "0x" + Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function createVoteCommitment({ electionId, candidateId, secret, voterAddress }) {
  return ethers.solidityPackedKeccak256(
    ["uint256", "uint256", "bytes32", "address"],
    [BigInt(electionId), BigInt(candidateId), secret, voterAddress]
  );
}

export function saveCommitmentLocally(electionId, voterAddress, data) {
  const key = "dvote_commit_" + electionId + "_" + String(voterAddress).toLowerCase();
  localStorage.setItem(key, JSON.stringify(data));
}

export function loadLocalCommitment(electionId, voterAddress) {
  const key = "dvote_commit_" + electionId + "_" + String(voterAddress).toLowerCase();
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
