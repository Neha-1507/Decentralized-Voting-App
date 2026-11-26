import { useCallback, useEffect, useState } from "react";
import { connectWallet } from "./contract.js";
import ElectionCard from "./components/ElectionCard.jsx";
import AdminPanel from "./components/AdminPanel.jsx";

export default function App() {
  const [wallet, setWallet] = useState(null); // { account, contract }
  const [isAdmin, setIsAdmin] = useState(false);
  const [elections, setElections] = useState([]);
  const [error, setError] = useState("");

  const loadElections = useCallback(async (contract) => {
    const count = Number(await contract.electionCount());
    const list = [];
    for (let id = 0; id < count; id++) {
      const e = await contract.getElection(id);
      const cands = await contract.getCandidates(id);
      list.push({
        id,
        title: e.title,
        startTime: Number(e.startTime),
        endTime: Number(e.endTime),
        status: Number(e.status),
        candidates: cands.map((c) => ({ name: c.name, votes: Number(c.voteCount) })),
      });
    }
    setElections(list.reverse());
  }, []);

  const connect = async () => {
    try {
      setError("");
      const w = await connectWallet();
      setWallet(w);
      const admin = await w.contract.admin();
      setIsAdmin(admin.toLowerCase() === w.account.toLowerCase());
      await loadElections(w.contract);
    } catch (e) {
      setError(e.shortMessage || e.message);
    }
  };

  // Refresh when the user switches account in MetaMask
  useEffect(() => {
    if (!window.ethereum) return;
    const onChange = () => window.location.reload();
    window.ethereum.on?.("accountsChanged", onChange);
    return () => window.ethereum.removeListener?.("accountsChanged", onChange);
  }, []);

  const refresh = () => wallet && loadElections(wallet.contract);

  return (
    <div className="container">
      <header>
        <h1>🗳️ DVote</h1>
        {wallet ? (
          <span className="muted">
            {wallet.account.slice(0, 6)}...{wallet.account.slice(-4)} {isAdmin && "(admin)"}
          </span>
        ) : (
          <button onClick={connect}>Connect MetaMask</button>
        )}
      </header>

      {error && <div className="error">{error}</div>}

      {wallet && isAdmin && <AdminPanel contract={wallet.contract} elections={elections} onDone={refresh} />}

      {wallet && elections.length === 0 && <div className="card muted">No elections yet.</div>}

      {wallet &&
        elections.map((el) => (
          <ElectionCard key={el.id} election={el} wallet={wallet} onDone={refresh} />
        ))}
    </div>
  );
}
