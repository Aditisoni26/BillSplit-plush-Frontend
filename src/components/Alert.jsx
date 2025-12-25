import { useAlert } from "../context/AlertContext";

export default function Alert() {
  const { alert, clearAlert } = useAlert();

  if (!alert) return null;

  const colors = {
    success: "#16a34a",
    error: "#dc2626",
    warning: "#f59e0b",
    info: "#2563eb"
  };

  return (
    <div style={overlay}>
      <div
        style={{
          ...card,
          borderTop: `5px solid ${colors[alert.type]}`
        }}
      >
        <button style={closeBtn} onClick={clearAlert}>
          ✕
        </button>

        <div
          style={{
            ...message,
            color: colors[alert.type]
          }}
        >
          {alert.message}
        </div>
      </div>
    </div>
  );
}
const overlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  paddingTop: "24px",
  zIndex: 9999,
  pointerEvents: "none" // allows clicks through except alert
};

const card = {
  background: "white",
  padding: "16px 20px",
  borderRadius: 12,
  boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
  minWidth: 320,
  maxWidth: 420,
  position: "relative",
  pointerEvents: "auto",
  animation: "slideDown 0.2s ease-out"
};

const message = {
  fontSize: 15,
  fontWeight: 600,
  textAlign: "center",
  paddingRight: 20
};

const closeBtn = {
  position: "absolute",
  top: 8,
  right: 10,
  border: "none",
  background: "transparent",
  fontSize: 18,
  cursor: "pointer",
  color: "#64748b"
};
