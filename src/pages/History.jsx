import { useEffect, useState } from "react";
import api from "../api/axios";

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/history")
      .then(res => setHistory(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ padding: 24 }}>Loading history...</p>;

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 20 }}>Activity History (Last 7 Days)</h2>

      {history.length === 0 && (
        <p style={{ color: "#64748b" }}>No recent activity</p>
      )}

      {history.map(h => (
        <div
          key={h._id}
          style={{
            background: "white",
            padding: 14,
            borderRadius: 10,
            marginBottom: 12,
            borderLeft: "4px solid #6366f1"
          }}
        >
          <div style={{ fontWeight: 600 }}>
            {h.action}
          </div>

          <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
            Group: {h.group?.name || "Deleted group"}
          </div>

          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
            {new Date(h.createdAt).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
