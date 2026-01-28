// pages/group.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext";

export default function Group() {
  const { id } = useParams();
  const { user } = useAuth();
  const loggedInUserId = user?._id;
  const { showAlert } = useAlert();

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [settlement, setSettlement] = useState([]);
  const [newMemberUsername, setNewMemberUsername] = useState("");
  const [settlementLoaded, setSettlementLoaded] = useState(false);
  const [payments, setPayments] = useState([]);
  const [paidBy, setPaidBy] = useState("");
  const [splitType, setSplitType] = useState("equal");
  const [customSplits, setCustomSplits] = useState({});

  useEffect(() => {
    api.get(`/groups/${id}`).then((res) => setGroup(res.data));
    api.get(`/expenses/group/${id}`).then((res) => setExpenses(res.data));
    api.get(`/settlement/payments/${id}`).then((res) => setPayments(res.data));
  }, [id]);

  useEffect(() => {
    if (expenses.length > 0) {
      api.get(`/settlement/${id}`).then((res) => {
        setSettlement(res.data);
        setSettlementLoaded(true);
      });
    }
  }, [expenses, id]);

  if (!group) return <p style={{ padding: 24 }}>Loading...</p>;

  const memberMap = {};
  group.members.forEach((m) => (memberMap[m._id] = m.name));

  const getPayment = (s) =>
    payments.find(
      (p) =>
        String(p.from) === String(s.from) &&
        String(p.to) === String(s.to) &&
        Number(p.amount) === Number(s.amount)
    );

  const addExpense = async () => {
    if (!description.trim()) {
      return showAlert("Description required", "error");
    }
    if (!amount || Number(amount) <= 0) {
      return showAlert("Invalid amount", "error");
    }

    if (!paidBy) return showAlert("Select who paid");

    try {
      const splits =
  splitType === "equal"
    ? []
    : Object.entries(customSplits).map(([userId, amount]) => ({
        userId,
        amount: Number(amount),
      }));


      if (splitType === "unequal") {
        const total = Object.values(customSplits).reduce((a, b) => a + b, 0);
        if (total !== Number(amount)) {
          return showAlert("Split amounts must equal total", "error");
        }
      }

      if (splitType === "percentage") {
        const total = Object.values(customSplits).reduce((a, b) => a + b, 0);
        if (total !== 100) {
          return showAlert("Percentages must total 100%", "error");
        }
      }

      await api.post("/expenses", {
  groupId: id,
  amount: Number(amount),
  description,
  paidBy,
  splitType,
  splits,
});


      const updated = await api.get(`/expenses/group/${id}`);
      setExpenses(updated.data);
      setAmount("");
      setDescription("");
      setPaidBy("");
      setSplitType("equal");
      setCustomSplits({});

      showAlert("expense added successfully!");
    } catch (err) {
      showAlert("failed to add expense");
    }
  };

  const loadSettlement = async () => {
    const res = await api.get(`/settlement/${id}`);
    setSettlement(res.data);
  };

  const markPaid = async (s) => {
    await api.post("/settlement/pay", {
      groupId: id,
      from: s.from,
      to: s.to,
      amount: s.amount,
    });
    const res = await api.get(`/settlement/payments/${id}`);
    setPayments(res.data);
  };

  const confirmReceived = async (paymentId) => {
  try {
    const res = await api.post(`/settlement/confirm/${paymentId}`);

    // ALWAYS re-fetch truth from backend
    const [paymentsRes, settlementRes, expensesRes] = await Promise.all([
      api.get(`/settlement/payments/${id}`),
      api.get(`/settlement/${id}`),
      api.get(`/expenses/group/${id}`)
    ]);

    setPayments(paymentsRes.data);
    setSettlement(settlementRes.data);
    setExpenses(expensesRes.data);

    if (res.data.allSettled) {
      showAlert("All expenses settled 🎉");
    } else {
      showAlert("Payment confirmed");
    }
  } catch (err) {
    showAlert("Failed to confirm payment", "error");
  }
};

 const addMember = async () => {
  if (!newMemberUsername.trim()) {
    showAlert("Enter a username", "error");
    return;
  }

  try {
    const res = await api.post(`/groups/${id}/members`, {
      username: newMemberUsername,
    });

    setGroup(res.data);
    setNewMemberUsername("");
    showAlert("Member added successfully");
  } catch (err) {
    if (err.response?.status === 404) {
      showAlert("User does not exist", "error");
    } else {
      showAlert("Failed to add member", "error");
    }
  }
};


  const removeMember = async (memberId) => {
    if (!window.confirm("Remove this member?")) return;

    try {
      const res = await api.delete(`/groups/${id}/members/${memberId}`);
      setGroup(res.data);
       showAlert("member removed successfully!");
    } catch (err) {
      showAlert(err.response?.data?.message || "Cannot remove member");
    }
  };

  const deleteGroup = async () => {
    if (!window.confirm("Delete this group permanently")) return;
    await api.delete(`/groups/${id}`);
    window.location.href = "/";
  };

  return (
    <div style={page}>
      <div style={container}>
        {/* HEADER */}
        <div style={header}>
          <div>
            <h2 style={title}>{group.name}</h2>
            <p style={subtitle}>Manage expenses & settlements</p>
          </div>

          {String(group.createdBy) === String(loggedInUserId) && (
            <button style={dangerBtn} onClick={deleteGroup}>
              Delete Group
            </button>
          )}
        </div>

        <Section title="Members">
          {group.members.map((m) => (
            <Row key={m._id}>
              <span>{m.name}</span>
              {String(group.createdBy) === String(loggedInUserId) &&
                String(m._id) !== String(group.createdBy) && (
                  <button
                    style={textDanger}
                    onClick={() => removeMember(m._id)}
                  >
                    Remove
                  </button>
                )}
            </Row>
          ))}

          <div style={inline}>
            <input
              style={input}
              placeholder="Add member by username"
              value={newMemberUsername}
              onChange={(e) => setNewMemberUsername(e.target.value)}
            />
            <button style={primaryBtn} onClick={addMember}>
              Add
            </button>
          </div>
        </Section>

        <Section title="Expenses">
          {expenses.map((e) => (
            <Row key={e._id}>
              <div>
                <strong>{e.description}</strong>
                <div style={muted}>
                  Paid by {e.paidBy?.name} •{" "}
                  {new Date(e.createdAt).toLocaleString()}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <strong style={{ color: "#16a34a" }}>₹{e.amount}</strong>

                {String(group.createdBy) === String(loggedInUserId) && (
                  <button
                    style={textDanger}
                    onClick={async () => {
                      if (!window.confirm("Delete this expense?")) return;

                      await api.delete(`/expenses/${e._id}`);

                      const updated = await api.get(`/expenses/group/${id}`);
                      setExpenses(updated.data);
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </Row>
          ))}
        </Section>

        <Section title="Add Expense">
          <input
            style={input}
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            style={input}
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <select
            style={input}
            value={splitType}
            onChange={(e) => {
              setSplitType(e.target.value);
              setCustomSplits({});
            }}
          >
            <option value="equal">Equal</option>
            <option value="unequal">Unequal</option>
            <option value="percentage">Percentage</option>
          </select>
          {splitType !== "equal" &&
            group.members.map((m) => (
              <div
                key={m._id}
                style={{ display: "flex", gap: 10, marginBottom: 6 }}
              >
                <span style={{ width: 120 }}>{m.name}</span>

                <input
                  type="number"
                  placeholder={splitType === "percentage" ? "%" : "₹"}
                  value={customSplits[m._id] || ""}
                  onChange={(e) =>
                    setCustomSplits({
                      ...customSplits,
                      [m._id]: Number(e.target.value),
                    })
                  }
                  style={{ ...input, marginBottom: 0 }}
                />
              </div>
            ))}

          <select
            style={input}
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
          >
            <option value="">Paid by</option>
            {group.members.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>
          <button style={primaryBtn} onClick={addExpense}>
            Add Expense
          </button>
        </Section>

        <Section title="Settlement">
          <button style={secondaryBtn} onClick={loadSettlement}>
            Calculate Settlement
          </button>

          {settlementLoaded && settlement.length === 0 && (
            <p style={success}>All settled ✅</p>
          )}

          {settlement.map((s, i) => {
            const payment = getPayment(s);
            return (
              <Row key={i}>
                <span>
                  <strong>{memberMap[s.from]}</strong> →{" "}
                  <strong>{memberMap[s.to]}</strong> ₹{s.amount}
                </span>

                {!payment && (
                  <button
                    style={smallBtn}
                    disabled={String(loggedInUserId) !== String(s.from)}
                    onClick={() => markPaid(s)}
                  >
                    Mark Paid
                  </button>
                )}

                {payment?.status === "paid" && (
                  <button
                    style={smallBtn}
                    disabled={String(loggedInUserId) !== String(payment.to)}
                    onClick={() => confirmReceived(payment._id)}
                  >
                    Confirm
                  </button>
                )}

                {payment?.status === "confirmed" && (
                  <span style={success}>Settled</span>
                )}
              </Row>
            );
          })}
        </Section>
      </div>
    </div>
  );
}

/* ---------- SMALL UI HELPERS ---------- */

const Section = ({ title, children }) => (
  <div style={section}>
    <h4 style={sectionTitle}>{title}</h4>
    {children}
  </div>
);

const Row = ({ children }) => <div style={row}>{children}</div>;

/* ---------- STYLES ---------- */

const page = {
  background: "#f1f5f9",
  minHeight: "100vh",
  padding: 24,
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
};

const container = { maxWidth: 900, margin: "0 auto" };

const header = {
  background: "linear-gradient(135deg,#6366f1,#4f46e5)",
  padding: "24px 28px",
  borderRadius: 14,
  color: "white",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 28,
};

const title = {
  margin: 0,
  fontSize: 36,
  fontWeight: 700,
  letterSpacing: "-0.5px",
};

const subtitle = {
  marginTop: 6,
  fontSize: 15,
  opacity: 0.9,
  fontWeight: 400,
};

const section = {
  background: "white",
  borderRadius: 14,
  padding: "18px 20px",
  marginBottom: 22,
  borderLeft: "5px solid #6366f1",
};

const sectionTitle = {
  marginBottom: 14,
  fontSize: 17,
  fontWeight: 600,
  color: "#0f172a",
  letterSpacing: "-0.2px",
};

const row = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 0",
  borderBottom: "1px solid #e5e7eb",
};

const inline = { display: "flex", gap: 10, marginTop: 12 };

const input = {
  width: "100%",
  padding: "10px 12px",
  marginBottom: 10,
  borderRadius: 10,
  border: "1px solid #d1d5db",
  fontSize: 14,
};

const primaryBtn = {
  background: "#6366f1",
  color: "white",
  border: "none",
  padding: "10px 18px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 600,
  letterSpacing: "0.2px",
};

const secondaryBtn = {
  background: "#0f172a",
  color: "white",
  border: "none",
  padding: "10px 18px",
  borderRadius: 10,
  marginBottom: 12,
  cursor: "pointer",
  fontWeight: 500,
};

const dangerBtn = {
  background: "#ef4444",
  color: "white",
  border: "none",
  padding: "8px 16px",
  borderRadius: 10,
  fontWeight: 600,
};

const smallBtn = {
  padding: "6px 12px",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  background: "#fff",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 500,
};

const textDanger = {
  background: "none",
  border: "none",
  color: "#ef4444",
  cursor: "pointer",
  fontWeight: 500,
};

const muted = {
  fontSize: 12,
  color: "#64748b",
  marginTop: 2,
};

const success = {
  color: "#16a34a",
  fontWeight: 600,
};
