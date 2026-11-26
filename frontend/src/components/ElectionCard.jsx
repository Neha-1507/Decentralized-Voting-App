import { useEffect, useState } from "react";

const STATUS = ["Upcoming", "Active", "Ended"];
const fmt = (ts) => new Date(ts * 1000).toLocaleString();

export default function ElectionCard({ election, wallet, onDone }) {
  const { contract, account } = wallet;
  const [registered, setRegistered] = useState(false);
  const [voted, setVoted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    (async () => {
      setRegistered(await contract.isRegistered(election.id, account));
      setVoted(await contract.hasVoted(election.id, account));
    })();
  }, [contract, account, election.id, election.status]);

  const total = election.candidates.reduce((s, c) => s + c.votes, 0);

  const vote = async (index) => {
    try {
      setBusy(true);
      setMsg({ type: "", text: "" });
      const tx = await contract.vote(election.id, index);
      await tx.wait();
      setMsg({ type: "info", text: `Vote recorded. Tx: ${tx.hash}` });
      setVoted(true);
      onDone();
    } catch (e) {
      setMsg({ type: "error", text: e.reason || e.shortMessage || e.message });
    } finally {
      setBusy(false);
    }
  };

  const canVote = election.status === 1 && registered && !voted;

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h3 style={{ margin: 0 }}>#{election.id} {election.title}</h3>
        <span className={`badge ${election.status === 1 ? "active" : election.status === 2 ? "ended" : ""}`}>
          {STATUS[election.status]}
        </span>
      </div>
      <div className="muted">{fmt(election.startTime)} → {fmt(election.endTime)}</div>
      <div className="muted">
        {registered ? "You are a registered voter" : "You are not registered for this election"}
        {voted && " · You have voted"}
      </div>

      {election.candidates.map((c, i) => {
        const pct = total ? Math.round((c.votes / total) * 100) : 0;
        return (
          <div key={i} className="row" style={{ marginTop: 10 }}>
            <div style={{ width: 130 }}>{c.name}</div>
            <div className="bar"><div style={{ width: `${pct}%` }} /></div>
            <div style={{ width: 80, textAlign: "right" }}>{c.votes} ({pct}%)</div>
            <button disabled={!canVote || busy} onClick={() => vote(i)}>Vote</button>
          </div>
        );
      })}

      <div className="muted" style={{ marginTop: 10 }}>Total votes: {total}</div>
      {msg.text && <div className={msg.type}>{msg.text}</div>}
    </div>
  );
}
