import { useState } from "react";
import { isAddress } from "ethers";
import { useToast } from "./Toast.jsx";

export default function AdminPanel({ contract, elections, onDone }) {
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [electionId, setElectionId] = useState("");
  const [candidate, setCandidate] = useState("");
  const [voters, setVoters] = useState("");
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const run = async (fn, okText) => {
    try {
      setBusy(true);
      const tx = await fn();
      await tx.wait();
      toast.success(okText);
      onDone();
    } catch (e) {
      toast.error(e.reason || e.shortMessage || e.message);
    } finally {
      setBusy(false);
    }
  };

  const createElection = () => {
    const s = Math.floor(new Date(start).getTime() / 1000);
    const e = Math.floor(new Date(end).getTime() / 1000);
    return run(() => contract.createElection(title, s, e), "Election created");
  };

  const addCandidate = () =>
    run(() => contract.addCandidate(Number(electionId), candidate), "Candidate added");

  const registerVoters = () => {
    const list = voters.split(/[\s,]+/).filter(Boolean);
    const bad = list.find((a) => !isAddress(a));
    if (bad) return toast.error(`Invalid address: ${bad}`);
    return run(() => contract.registerVoters(Number(electionId), list), `${list.length} voter(s) registered`);
  };

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Admin panel</h3>

      <strong>1. Create election</strong>
      <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <div className="row">
        <div style={{ flex: 1 }}>
          <div className="muted">Start</div>
          <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <div className="muted">End</div>
          <input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
      </div>
      <button disabled={busy || !title || !start || !end} onClick={createElection}>Create</button>

      <hr style={{ borderColor: "#2c3254", margin: "18px 0" }} />

      <strong>2. Candidates / voters</strong>
      <div className="muted">Election</div>
      <select
        value={electionId}
        onChange={(e) => setElectionId(e.target.value)}
        style={{ width: "100%", padding: 8, margin: "4px 0 8px", borderRadius: 8 }}
      >
        <option value="">Select election</option>
        {elections.map((el) => (
          <option key={el.id} value={el.id}>#{el.id} {el.title}</option>
        ))}
      </select>

      <div className="row">
        <input style={{ flex: 1 }} placeholder="Candidate name" value={candidate} onChange={(e) => setCandidate(e.target.value)} />
        <button disabled={busy || electionId === "" || !candidate} onClick={addCandidate}>Add candidate</button>
      </div>

      <textarea rows={3} placeholder="Voter wallet addresses (comma / space / newline separated)" value={voters} onChange={(e) => setVoters(e.target.value)} />
      <button disabled={busy || electionId === "" || !voters} onClick={registerVoters}>Register voters</button>
    </div>
  );
}
