import React, { useMemo, useState } from "react";
import { getReceiptQrImageUrl, verifyReceiptPayload } from "../utils/qrVerification";
import { analyzeElectionEvents } from "../utils/fraudAlerts";

export default function SecurityPanel({ receipt, events = [] }) {
  const [showQr, setShowQr] = useState(false);
  const [rawInput, setRawInput] = useState("");
  const [verifyResult, setVerifyResult] = useState(null);

  const alerts = useMemo(() => analyzeElectionEvents(events), [events]);

  function handleVerify(e) {
    e.preventDefault();
    setVerifyResult(verifyReceiptPayload(rawInput));
  }

  return (
    <section className="card" style={{ marginTop: "1rem" }}>
      <h3 style={{ marginTop: 0 }}>Security, QR Verification & Fraud Alerts</h3>
      {receipt && (
        <div style={{ marginBottom: "1rem" }}>
          <button type="button" onClick={() => setShowQr((v) => !v)}>
            {showQr ? "Hide Receipt QR" : "Show Receipt QR"}
          </button>
          {showQr && (
            <div style={{ marginTop: "0.75rem" }}>
              <img src={getReceiptQrImageUrl(receipt, 180)} alt="Vote Receipt QR Code" width={180} height={180} />
              <p style={{ fontSize: "0.85rem", color: "#4b5563" }}>
                Scan to verify election #{receipt.electionId} tx {receipt.txHash?.slice(0, 12)}...
              </p>
            </div>
          )}
        </div>
      )}
      <form onSubmit={handleVerify} style={{ marginBottom: "1rem" }}>
        <label style={{ display: "block", fontWeight: 600, marginBottom: "0.35rem" }}>
          Verify Vote Receipt JSON / QR Payload
        </label>
        <textarea
          rows={3}
          style={{ width: "100%", marginBottom: "0.5rem" }}
          placeholder="Paste receipt JSON payload here..."
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
        />
        <button type="submit">Verify Receipt</button>
        {verifyResult && (
          <p style={{ color: verifyResult.valid ? "#15803d" : "#b91c1c", marginTop: "0.5rem" }}>
            {verifyResult.valid
              ? `Valid DVote Receipt — Voter ${verifyResult.receipt.voter} | Tx ${verifyResult.receipt.txHash}`
              : verifyResult.reason}
          </p>
        )}
      </form>
      <div>
        <h4 style={{ marginBottom: "0.4rem" }}>Live Fraud & Anomaly Alerts ({alerts.length})</h4>
        {alerts.length === 0 ? (
          <p style={{ color: "#15803d", margin: 0 }}>No suspicious activity detected.</p>
        ) : (
          <ul style={{ paddingLeft: "1.2rem", margin: 0 }}>
            {alerts.map((a) => (
              <li key={a.id} style={{ marginBottom: "0.35rem" }}>
                <strong>[{a.severity.toUpperCase()}]</strong> {a.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
