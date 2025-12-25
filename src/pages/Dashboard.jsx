import { useState, useEffect } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";


export default function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    api.get("/groups/my").then(res => setGroups(res.data));
  }, []);

  const createGroup = async () => {
    if (!name.trim()) return;
    const res = await api.post("/groups", { name });
    setGroups(prev => [...prev, res.data]);
    setName("");
  };

  const totalMembers = groups.reduce(
    (sum, g) => sum + g.members.length,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-slate-100 px-6 py-10">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ">
          <div>
            <h1 className="text-3xl font-semibold text-slate-800">
              Dashboard
            </h1>
            <p className="text-slate-600 mt-1">
              Manage your expense groups and settlements
            </p>
          </div>

          <div className="text-sm text-slate-500">
            BillSplit+ • Smart Expense System
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Stat
            title="Groups"
            value={groups.length}
            color="indigo"
          />
          <Stat
            title="Total Members"
            value={totalMembers}
            color="violet"
          />
          <Stat
            title="Active Settlements"
            value="—"
            color="emerald"
          />
        </div>

        {/* CREATE GROUP */}
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col md:flex-row gap-4 items-center border border-indigo-100">
          <input
            className="flex-1 border border-slate-300 rounded-xl px-5 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Create a new group (Trip, Flat, Office...)"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <button
            onClick={createGroup}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition"
          >
            + Create Group
          </button>
        </div>

        {/* GROUP LIST */}
        <div>
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            Your Groups
          </h2>

          {groups.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center text-slate-500 border border-slate-200">
              <p className="text-lg mb-1">No groups yet</p>
              <p>Create a group to start tracking expenses</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map(group => (
                <Link
                  key={group._id}
                  to={`/group/${group._id}`}
                  className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1 p-6 border border-slate-200"
                >
                  {/* HEADER */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center text-xl font-bold">
                      {group.name.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <p className="font-semibold text-slate-800 text-lg">
                        {group.name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {group.members.length} members
                      </p>
                    </div>
                  </div>

                  {/* FOOTER */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">
                      Expense group
                    </span>
                    <span className="text-indigo-600 font-medium group-hover:underline">
                      Open →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- STAT CARD ---------- */
function Stat({ title, value, color }) {
  const colorMap = {
    indigo: "from-indigo-500 to-indigo-600",
    violet: "from-violet-500 to-violet-600",
    emerald: "from-emerald-500 to-emerald-600",
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-200">
      <div
        className={`inline-block px-3 py-1 rounded-full text-white text-sm bg-gradient-to-r ${colorMap[color]}`}
      >
        {title}
      </div>
      <p className="text-3xl font-semibold text-slate-800 mt-4">
        {value}
      </p>
    </div>
  );
}
