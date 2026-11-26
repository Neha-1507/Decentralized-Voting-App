const DEFAULT_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

export function normalizeIpfsUri(uriOrCid) {
  if (!uriOrCid) return "";
  const trimmed = String(uriOrCid).trim();
  if (trimmed.startsWith("ipfs://")) {
    return trimmed;
  }
  const cleanCid = trimmed.replace(/^\/+/, "");
  return `ipfs://${cleanCid}`;
}

export function ipfsToHttp(uriOrCid, gateway = DEFAULT_GATEWAY) {
  if (!uriOrCid) return "";
  const trimmed = String(uriOrCid).trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  const cidPath = trimmed.replace(/^ipfs:\/\//i, "").replace(/^\/+/, "");
  const base = gateway.endsWith("/") ? gateway : `${gateway}/`;
  return `${base}${cidPath}`;
}

export async function uploadFileToPinata(file, jwt = import.meta.env.VITE_PINATA_JWT) {
  if (!jwt) {
    throw new Error("VITE_PINATA_JWT is not configured. Paste an existing IPFS CID/URI instead.");
  }
  if (!file) {
    throw new Error("No file selected for IPFS upload.");
  }

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
    body: formData,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.IpfsHash) {
    throw new Error(data.error?.details || data.error || "Failed to upload file to Pinata.");
  }

  return {
    cid: data.IpfsHash,
    uri: `ipfs://${data.IpfsHash}`,
    url: ipfsToHttp(data.IpfsHash),
  };
}

export async function uploadJsonToPinata(payload, name = "candidate-profile.json", jwt = import.meta.env.VITE_PINATA_JWT) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const file = new File([blob], name, { type: "application/json" });
  return uploadFileToPinata(file, jwt);
}
