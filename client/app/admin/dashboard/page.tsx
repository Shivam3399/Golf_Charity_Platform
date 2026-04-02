"use client";

import styles from "./admin.module.css";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const [active, setActive] = useState("users");

  const [users, setUsers] = useState<any[]>([]);
  const [winners, setWinners] = useState<any[]>([]);
  const [charities, setCharities] = useState<any[]>([]);
  const [drawNumbers, setDrawNumbers] = useState<number[]>([]);
  const [newCharity, setNewCharity] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: users } = await supabase.from("profiles").select("*");
    const { data: winners } = await supabase.from("winners").select("*");
    const { data: charities } = await supabase.from("charities").select("*");

    setUsers(users || []);
    setWinners(winners || []);
    setCharities(charities || []);
  };

  /* ACTIONS */

  const toggleSubscription = async (id: string, current: boolean) => {
    await supabase
      .from("profiles")
      .update({ is_active: !current })
      .eq("id", id);
    fetchData();
  };

  const runSimulation = () => {
    const nums = Array.from({ length: 5 }, () =>
      Math.floor(Math.random() * 100),
    );
    setDrawNumbers(nums);
  };

  const publishResults = async () => {
    if (!drawNumbers.length) {
      alert("Run simulation first");
      return;
    }

    if (!users.length) {
      alert("No users available");
      return;
    }

    const randomIndex = Math.floor(Math.random() * users.length);
    const winner = users[randomIndex];

    if (!winner || !winner.id) {
      alert("Invalid winner");
      return;
    }

    await supabase.from("winners").insert([
      {
        user_id: winner.id,
        amount: 100,
        status: "pending",
      },
    ]);

    setDrawNumbers([]);
    fetchData();
  };

  const verifyWinner = async (id: string) => {
    await supabase.from("winners").update({ status: "approved" }).eq("id", id);
    fetchData();
  };

  const markPaid = async (id: string) => {
    await supabase.from("winners").update({ status: "paid" }).eq("id", id);
    fetchData();
  };

  const addCharity = async () => {
    if (!newCharity) return;
    await supabase.from("charities").insert([{ name: newCharity }]);
    setNewCharity("");
    fetchData();
  };

  const deleteCharity = async (id: string) => {
    await supabase.from("charities").delete().eq("id", id);
    fetchData();
  };

  const revenue = winners.reduce((s, w) => s + (w.amount || 0), 0);

  return (
    <div className={styles.app}>
      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <h2>Admin</h2>
        <p>Dashboard</p>
        <p>Users</p>
        <p>Draws</p>
      </aside>

      {/* MAIN */}
      <div className={styles.main}>
        {/* NAVBAR */}
        <div className={styles.navbar}>
          <h1>Dashboard</h1>
        </div>

        {/* SMALL CARDS */}
        <div className={styles.grid}>
          <div onClick={() => setActive("users")} className={styles.smallCard}>
            Users
          </div>
          <div onClick={() => setActive("draw")} className={styles.smallCard}>
            Draw
          </div>
          <div
            onClick={() => setActive("charity")}
            className={styles.smallCard}
          >
            Charities
          </div>
          <div
            onClick={() => setActive("winners")}
            className={styles.smallCard}
          >
            Winners
          </div>
          <div
            onClick={() => setActive("reports")}
            className={styles.smallCard}
          >
            Reports
          </div>
        </div>

        {/* PANEL */}
        <div className={styles.panel}>
          {/* USERS */}
          {active === "users" && (
            <>
              <h3>User Management</h3>
              {users.map((u) => (
                <div key={u.id} className={styles.row}>
                  <span>{u.email}</span>
                  <button onClick={() => toggleSubscription(u.id, u.is_active)}>
                    {u.is_active ? "Deactivate" : "Activate"}
                  </button>
                </div>
              ))}
            </>
          )}

          {/* DRAW */}
          {active === "draw" && (
            <>
              <div className={styles.drawSection}>
                <h3>Draw Simulation</h3>
                <div className={styles.buttonGroup}>
                  <button onClick={runSimulation}>Run Simulation</button>
                  <button onClick={publishResults}>Publish Results</button>
                </div>
              </div>

              <div className={styles.numbers}>
                {drawNumbers.map((n, i) => (
                  <span key={i}>{n}</span>
                ))}
              </div>
            </>
          )}

          {/* CHARITY */}
          {active === "charity" && (
            <>
              <h3>Charity Management</h3>

              <input
                value={newCharity}
                onChange={(e) => setNewCharity(e.target.value)}
              />
              <button onClick={addCharity}>Add</button>

              {charities.map((c) => (
                <div key={c.id} className={styles.row}>
                  <span>{c.name}</span>
                  <button onClick={() => deleteCharity(c.id)}>Delete</button>
                </div>
              ))}
            </>
          )}

          {/* WINNERS */}
          {active === "winners" && (
            <>
              <h3>Winners</h3>
              {winners.length === 0 && <p>No winners yet</p>}

              {winners.map((w) => (
                <div key={w.id} className={styles.row}>
                  <span>{w.user_id}</span>
                  <span>{w.status}</span>

                  <button onClick={() => verifyWinner(w.id)}>Verify</button>
                  <button onClick={() => markPaid(w.id)}>Pay</button>
                </div>
              ))}
            </>
          )}

          {/* REPORT */}
          {active === "reports" && (
            <>
              <h3>Reports</h3>

              <p>Total Users: {users.length}</p>
              <p>Total Winners: {winners.length}</p>
              <p>Total Revenue: ${revenue}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
