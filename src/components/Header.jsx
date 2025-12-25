import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext";
import api from "../api/axios";


export default function Header() {
  const navigate = useNavigate();
  const { user, logout: authLogout } = useAuth();
  const { showAlert } = useAlert();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  /* ---------------- LOAD NOTIFICATIONS ---------------- */
  useEffect(() => {
    if (!user) return;

    api.get("/notifications")
      .then(res => setNotifications(res.data))
      .catch(() => {});
  }, [user]);


  
  /* ---------------- LOGOUT ---------------- */
  const logout = () => {
    authLogout();
    showAlert("Logged out successfully");
    navigate("/login");
  };

  /* ---------------- DELETE NOTIFICATION ---------------- */
  const deleteNotification = async (id, e) => {
    e.stopPropagation(); // 🔥 prevent navigation
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch {
      showAlert("Failed to delete notification", "error");
    }
  };

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold tracking-wide">
          BillSplit+
        </Link>

        <nav className="flex items-center gap-6">

          <Link to="/" className="text-white/90 font-bold hover:text-white transition">
            Dashboard
          </Link>


          <button
  onClick={() => navigate("/history")}
  className="text-white/90 hover:text-white font-bold transition"
  title="Activity History"
>
  History
</button>


          {/* ================= NOTIFICATIONS ================= */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              style={{
                background: "none",
                border: "none",
                fontSize: 18,
                cursor: "pointer",
                color: "white",
                position: "relative"
              }}
            >
              🔔
              {notifications.some(n => !n.read) && (
                <span
                  style={{
                    position: "absolute",
                    top: -2,
                    right: -2,
                    width: 8,
                    height: 8,
                    background: "red",
                    borderRadius: "50%"
                  }}
                />
              )}
            </button>

            {notifOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: 42,
                  width: 340,
                  background: "white",
                  borderRadius: 14,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.18)",
                  zIndex: 100,
                  overflow: "hidden"
                }}
              >
                {/* HEADER */}
                <div
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #e5e7eb",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontWeight: 600,
                    fontSize: 14,
                    color: "#0f172a",
                    background: "#f8fafc"
                  }}
                >
                  <span>Notifications</span>
                  <button
                    onClick={() => setNotifOpen(false)}
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: 16,
                      cursor: "pointer",
                      color: "#64748b"
                    }}
                  >
                    ✕
                  </button>
                </div>

                {/* BODY */}
                <div style={{ maxHeight: 320, overflowY: "auto" }}>
                  {notifications.length === 0 && (
                    <p style={{
                      padding: 16,
                      fontSize: 13,
                      color: "#64748b",
                      textAlign: "center"
                    }}>
                      No notifications
                    </p>
                  )}

                  {notifications.map(n => (
                    <div
                      key={n._id}
                      onClick={async () => {
                        await api.post(`/notifications/${n._id}/read`);

                        setNotifications(prev =>
                          prev.map(x =>
                            x._id === n._id ? { ...x, read: true } : x
                          )
                        );

                        if (n.group?._id) {
                          navigate(`/group/${n.group._id}`);
                          setNotifOpen(false);
                        }
                      }}
                      style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid #f1f5f9",
                        cursor: "pointer",
                        background: n.read ? "#ffffff" : "#eef2ff",
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start"
                      }}
                    >
                      {/* UNREAD DOT */}
                      {!n.read && (
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "#4f46e5",
                            marginTop: 6
                          }}
                        />
                      )}

                      {/* CONTENT */}
                      <div style={{ flex: 1 }}>
                        {n.group?.name && (
                          <div style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#4f46e5",
                            marginBottom: 2
                          }}>
                            {n.group.name}
                          </div>
                        )}

                        <div style={{
                          fontSize: 13,
                          fontWeight: n.read ? 400 : 600,
                          color: "#0f172a"
                        }}>
                          {n.message}
                        </div>

                        <div style={{
                          fontSize: 11,
                          color: "#64748b",
                          marginTop: 2
                        }}>
                          {new Date(n.createdAt).toLocaleString()}
                        </div>
                      </div>

                      {/* DELETE BUTTON */}
                      <button
                        onClick={(e) => deleteNotification(n._id, e)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#94a3b8",
                          fontSize: 14,
                          cursor: "pointer"
                        }}
                        title="Delete notification"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ================= PROFILE ================= */}
          {user && (
            <div
              style={{ position: "relative" }}
              onMouseEnter={() => setProfileOpen(true)}
              onMouseLeave={() => setProfileOpen(false)}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#6366f1,#4f46e5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 18,
                  cursor: "pointer"
                }}
              >
                {(user.name || user.email)[0].toUpperCase()}
              </div>

              {profileOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: 52,
                    right: 0,
                    width: 180,
                    background: "#fff",
                    borderRadius: 12,
                    boxShadow: "0 10px 25px rgba(0,0,0,0.12)"
                  }}
                >
                  <div style={{
                    padding: "12px 14px",
                    borderBottom: "1px solid #e5e7eb"
                  }}>
                    <strong>{user.name || "User"}</strong>
                    <div style={{ fontSize: 12, color: "#64748b" }}>
                      {user.email}
                    </div>
                  </div>

                  <button
                    onClick={logout}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      background: "white",
                      border: "none",
                      textAlign: "left",
                      color: "#ef4444",
                      cursor: "pointer"
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
