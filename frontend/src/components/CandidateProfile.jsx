import React, { useEffect, useState } from "react";
import { ipfsToHttp } from "../utils/ipfs";

export default function CandidateProfile({ candidate, onClose }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadMetadata() {
      if (!candidate?.metadataURI) {
        setProfile(null);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const url = ipfsToHttp(candidate.metadataURI);
        const res = await fetch(url);
        if (!res.ok) throw new Error("Could not fetch candidate metadata from IPFS.");
        const data = await res.json();
        if (active) setProfile(data);
      } catch (err) {
        if (active) setError(err.message || "Failed to load IPFS profile.");
      } finally {
        if (active) setLoading(false);
      }
    }
    loadMetadata();
    return () => {
      active = false;
    };
  }, [candidate]);

  if (!candidate) return null;

  const photoUrl =
    profile?.image && String(profile.image).startsWith("ipfs://")
      ? ipfsToHttp(profile.image)
      : "";

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>{candidate.name}</h3>
          <button type="button" onClick={onClose}>Close</button>
        </div>

        {loading && <p>Loading IPFS profile...</p>}
        {error && <p style={{ color: "#b91c1c" }}>{error}</p>}

        {!loading && !error && !candidate.metadataURI && (
          <p>No IPFS profile attached for this candidate yet.</p>
        )}

        {!loading && profile && (
          <div style={{ marginTop: "0.75rem" }}>
            {photoUrl && (
              <img
                src={photoUrl}
                alt={candidate.name}
                style={{ width: "100%", maxHeight: "220px", objectFit: "cover", borderRadius: "8px", marginBottom: "0.75rem" }}
              />
            )}
            {profile.tagline && <p><strong>Tagline:</strong> {profile.tagline}</p>}
            {profile.manifesto && <p style={{ whiteSpace: "pre-line" }}>{profile.manifesto}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
