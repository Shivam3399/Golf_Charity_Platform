"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import styles from "../admin.module.css";

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [scores, setScores] = useState<any[]>([]);
  const [newScores, setNewScores] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchUsers();
    fetchScores();
  }, []);

  const fetchUsers = async () => {
    const { data } = await supabase.from("profiles").select("*");
    setUsers(data || []);
  };

  const fetchScores = async () => {
    const { data } = await supabase
      .from("scores")
      .select("*")
      .order("created_at", { ascending: false });

    setScores(data || []);
  };

  const addScore = async (userId: string) => {
    const value = newScores[userId];
    if (!value) return;

    await supabase.from("scores").insert([
      {
        user_id: userId,
        score: Number(value),
        played_at: new Date().toISOString(),
      },
    ]);

    setNewScores((prev) => ({ ...prev, [userId]: "" }));
    fetchScores();
  };

  const updateScore = async (scoreId: string, value: number) => {
    await supabase
      .from("scores")
      .update({ score: value })
      .eq("id", scoreId);

    fetchScores();
  };

  const toggleSubscription = async (userId: string, current: boolean) => {
    await supabase
      .from("profiles")
      .update({ is_active: !current })
      .eq("id", userId);

    fetchUsers();
  };

  return (
    <div className={styles.grid}>
      {users.map((user) => {
        const userScores = scores
          .filter((s) => s.user_id === user.id)
          .slice(0, 5);

        return (
          <div key={user.id} className={styles.card}>
            <h2>👤 User</h2>
            <p className={styles.userId}>{user.email}</p>

            {/* Subscription */}
            <button
              className={
                user?.is_active
                  ? styles.activeBtn
                  : styles.inactiveBtn
              }
              onClick={() =>
                toggleSubscription(user.id, user?.is_active || false)
              }
            >
              {user?.is_active ? "Active" : "Inactive"}
            </button>

            {/* Scores */}
            <div className={styles.section}>
              <h3>🏌️ Scores (Latest 5)</h3>

              {userScores.map((s) => (
                <div key={s.id} className={styles.scoreRow}>
                  <input
                    type="number"
                    defaultValue={s.score}
                    onBlur={(e) =>
                      updateScore(s.id, Number(e.target.value))
                    }
                    className={styles.scoreInput}
                  />
                  <span className={styles.date}>
                    {new Date(s.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}

              <div className={styles.addRow}>
                <input
                  type="number"
                  placeholder="Add score"
                  value={newScores[user.id] || ""}
                  onChange={(e) =>
                    setNewScores({
                      ...newScores,
                      [user.id]: e.target.value,
                    })
                  }
                  className={styles.input}
                />

                <button
                  className={styles.addBtn}
                  onClick={() => addScore(user.id)}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}