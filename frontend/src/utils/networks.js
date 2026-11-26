export const SUPPORTED_NETWORKS = {
  31337: {
    chainIdHex: "0x7a69",
    chainName: "Hardhat Localhost",
    rpcUrls: ["http://127.0.0.1:8545"],
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    blockExplorerUrls: [],
  },
  80002: {
    chainIdHex: "0x13882",
    chainName: "Polygon Amoy Testnet",
    rpcUrls: ["https://rpc-amoy.polygon.technology"],
    nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
    blockExplorerUrls: ["https://amoy.polygonscan.com"],
  },
};

export async function switchOrAddNetwork(chainId = 31337) {
  if (!window.ethereum) throw new Error("MetaMask is not installed.");
  const target = SUPPORTED_NETWORKS[Number(chainId)];
  if (!target) throw new Error("Unsupported network chainId: " + chainId);
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: target.chainIdHex }],
    });
  } catch (err) {
    if (err.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: target.chainIdHex,
            chainName: target.chainName,
            rpcUrls: target.rpcUrls,
            nativeCurrency: target.nativeCurrency,
            blockExplorerUrls: target.blockExplorerUrls,
          },
        ],
      });
    } else {
      throw err;
    }
  }
}

export function getExplorerTxUrl(chainId, txHash) {
  const net = SUPPORTED_NETWORKS[Number(chainId)];
  const base = net?.blockExplorerUrls?.[0];
  if (!base || !txHash) return "";
  return base + "/tx/" + txHash;
}
