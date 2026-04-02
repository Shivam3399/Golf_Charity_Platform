"use client";

import styles from "./dashboard.module.css";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [scores, setScores] = useState<any[]>([]);
  const [newScore, setNewScore] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [charities, setCharities] = useState<any[]>([]);
  const [selectedCharity, setSelectedCharity] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        window.location.href = "/login";
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .single();

      // 🚫 Block admin from user dashboard
      if (profile?.role === "admin") {
        window.location.href = "/admin/dashboard";
      }
    };

    checkUser();
    fetchData();
  }, []);

  const fetchData = async () => {
    // ✅ Get logged-in user
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      window.location.href = "/login";
      return;
    }

    setUser(userData.user);

    // ✅ Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userData.user.id)
      .single();

    setProfile(profileData);

    // ✅ Set selected charity from profile
    setSelectedCharity(profileData?.charity_id || "");

    // ✅ Fetch charities list
    const { data: charityData } = await supabase.from("charities").select("*");

    setCharities(charityData || []);

    // ✅ Fetch scores
    const { data: scoreData } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    setScores(scoreData || []);
  };

  // ✅ Add new score
  const addScore = async () => {
    if (!newScore || !user) return;

    await supabase.from("scores").insert([
      {
        user_id: user.id,
        score: Number(newScore),
      },
    ]);

    setNewScore("");
    fetchData();
  };

  // ✅ Update score
  const updateScore = async (id: string, value: number) => {
    await supabase.from("scores").update({ score: value }).eq("id", id);
    fetchData();
  };

  // ✅ Save charity
  const saveCharity = async () => {
    if (!user) return;

    await supabase
      .from("profiles")
      .update({ charity_id: selectedCharity })
      .eq("id", user.id);

    fetchData();
  };

  // ✅ Logout
  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className={styles.container}>
      {/* 🔝 NAVBAR */}
      <div className={styles.navbar}>
        <h1>🏌️ Dashboard</h1>

        <div
          className={styles.userBox}
          onClick={() => setShowDropdown(!showDropdown)}
        >
          {profile?.full_name || "User"} ⌄
          {showDropdown && (
            <div className={styles.userDropdown}>
              <p>
                Status:{" "}
                <span
                  className={
                    profile?.is_active ? styles.active : styles.inactive
                  }
                >
                  {profile?.is_active ? "Active" : "Inactive"}
                </span>
              </p>

              <button onClick={logout}>Logout</button>
            </div>
          )}
        </div>
      </div>

      {/* 📊 MAIN */}
      <div className={styles.main}>
        {/* ⛳ SCORES */}
        <div className={styles.card}>
          <h3>Your Scores</h3>

          {/* ADD SCORE */}
          <div className={styles.scoreInput}>
            <input
              placeholder="Enter new score"
              value={newScore}
              onChange={(e) => setNewScore(e.target.value)}
            />
            <button onClick={addScore}>Add</button>
          </div>

          {/* SCORE LIST */}
          <div className={styles.scoreList}>
            {scores.length === 0 && <p>No scores yet</p>}

            {scores.map((s) => (
              <div key={s.id} className={styles.scoreRow}>
                <input
                  type="number"
                  value={s.score}
                  onChange={(e) => updateScore(s.id, Number(e.target.value))}
                />
                <span className={styles.date}>
                  {new Date(s.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ❤️ CHARITY */}
        <div className={styles.card}>
          <h3>Selected Charity</h3>

          <div className={styles.charityRow}>
            <select
              value={selectedCharity || ""}
              onChange={(e) => setSelectedCharity(e.target.value)}
              className={styles.selectDropdown}
            >
              <option value="">Select charity</option>

              {charities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <button onClick={saveCharity} className={styles.saveBtn}>
              Save
            </button>
          </div>

          <p className={styles.contribution}>Contribution: 10%</p>
        </div>

        {/* 🎯 PARTICIPATION */}
        <div className={styles.card}>
          <h3>Participation</h3>
          <p>Draws Entered: 5</p>
          <p>Upcoming Draws: 2</p>
        </div>

        {/* 🏆 WINNINGS */}
        <div className={styles.card}>
          <h3>Winnings</h3>
          <p>Total Won: $200</p>
          <p>Status: Pending</p>
        </div>
      </div>
    </div>
  );
}
