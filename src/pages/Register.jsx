import { useState } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { useAlert } from "../context/AlertContext";


export default function Register() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
   try{ await api.post("/auth/register", {
      name,
      username,
      email,
      password
    });
    showAlert("Account created successfully! please login");
    navigate("/login");
  }catch(err){
    showAlert("Registration failed");
  }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 p-8">

        {/* BRAND */}
        <br /><br />
        <div className="text-center mb-8">
          
          <h1 className="text-2xl font-semibold text-slate-800 mt-4">
            Create account
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Start managing shared expenses
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={submit} className="space-y-4">

          <Input
            label="Full Name"
            placeholder="Aditi Soni"
            value={name}
            onChange={setName}
          />

          <Input
            label="Username"
            placeholder="aditi123"
            value={username}
            onChange={setUsername}
          />

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={setEmail}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={setPassword}
          />

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium transition mt-4"
          >
            Create Account
          </button>
        </form>

        {/* FOOTER */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-600 font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

/* ---------- INPUT COMPONENT ---------- */
function Input({ label, type = "text", value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        required
      />
    </div>
  );
}
