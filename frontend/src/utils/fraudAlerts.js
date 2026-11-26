export function analyzeElectionEvents(events = [], options = {}) {
  const {
    burstWindowSec = 15,
    burstThreshold = 4,
  } = options;

  const alerts = [];
  const voteEvents = events
    .filter((e) => e.type === "VoteCast" || e.eventName === "VoteCast")
    .slice()
    .sort((a, b) => Number(a.timestamp || a.blockNumber || 0) - Number(b.timestamp || b.blockNumber || 0));

  // 1. Detect rapid burst of votes within a short window
  for (let i = 0; i < voteEvents.length; i++) {
    const startTs = Number(voteEvents[i].timestamp || 0);
    if (!startTs) continue;
    let count = 1;
    for (let j = i + 1; j < voteEvents.length; j++) {
      const nextTs = Number(voteEvents[j].timestamp || 0);
      if (nextTs - startTs <= burstWindowSec) {
        count++;
      } else {
        break;
      }
    }
    if (count >= burstThreshold) {
      alerts.push({
        id: `burst-${i}-${startTs}`,
        severity: "warning",
        code: "RAPID_VOTE_BURST",
        message: `${count} votes recorded within ${burstWindowSec}s window.`,
        timestamp: startTs,
      });
      break;
    }
  }

  // 2. Detect duplicate voter addresses in event logs (defense-in-depth check)
  const seenVoters = new Set();
  for (const ev of voteEvents) {
    const voter = String(ev.voter || ev.args?.voter || "").toLowerCase();
    if (!voter) continue;
    if (seenVoters.has(voter)) {
      alerts.push({
        id: `dup-${voter}`,
        severity: "critical",
        code: "DUPLICATE_VOTER_EVENT",
        message: `Duplicate vote event detected for address ${voter}.`,
        timestamp: Number(ev.timestamp || Date.now()),
      });
    } else {
      seenVoters.add(voter);
    }
  }

  // 3. Flag emergency pause or election cancellation events
  for (const ev of events) {
    const name = ev.type || ev.eventName;
    if (name === "Paused" || name === "ElectionCancelled") {
      alerts.push({
        id: `status-${name}-${ev.blockNumber || Date.now()}`,
        severity: "info",
        code: name === "Paused" ? "CONTRACT_PAUSED" : "ELECTION_CANCELLED",
        message:
          name === "Paused"
            ? "Emergency pause triggered on voting contract."
            : `Election #${ev.electionId ?? ""} was cancelled by admin.`,
        timestamp: Number(ev.timestamp || Date.now()),
      });
    }
  }

  return alerts;
}
