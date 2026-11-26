export function buildVoteReceiptPayload({
  electionId,
  electionTitle = "",
  candidateId,
  candidateName = "",
  voterAddress,
  txHash,
  chainId = 31337,
  timestamp = Date.now(),
}) {
  return {
    app: "DVote",
    version: "1.0",
    electionId: String(electionId ?? ""),
    electionTitle,
    candidateId: String(candidateId ?? ""),
    candidateName,
    voter: voterAddress ? String(voterAddress).toLowerCase() : "",
    txHash: txHash || "",
    chainId: Number(chainId),
    issuedAt: new Date(timestamp).toISOString(),
  };
}

export function encodeReceiptQrData(receiptData) {
  const payload = buildVoteReceiptPayload(receiptData);
  return JSON.stringify(payload);
}

export function getReceiptQrImageUrl(receiptData, size = 180) {
  const encoded = encodeURIComponent(encodeReceiptQrData(receiptData));
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}`;
}

export function verifyReceiptPayload(rawJson) {
  try {
    const parsed = typeof rawJson === "string" ? JSON.parse(rawJson) : rawJson;
    if (!parsed || parsed.app !== "DVote") {
      return { valid: false, reason: "Not a valid DVote receipt payload." };
    }
    if (!parsed.txHash || !/^0x[a-fA-F0-9]{64}$/.test(parsed.txHash)) {
      return { valid: false, reason: "Missing or malformed transaction hash." };
    }
    if (!parsed.voter || !/^0x[a-fA-F0-9]{40}$/.test(parsed.voter)) {
      return { valid: false, reason: "Missing or malformed voter wallet address." };
    }
    return { valid: true, receipt: parsed };
  } catch {
    return { valid: false, reason: "Invalid JSON format in QR data." };
  }
}
