"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Analytics() {
  const [users, setUsers] = useState(0);
  const [scores, setScores] = useState(0);

  const fetchData = async () => {
    const { count: userCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const { count: scoreCount } = await supabase
      .from("scores")
      .select("*", { count: "exact", head: true });

    setUsers(userCount || 0);
    setScores(scoreCount || 0);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <h2>📊 Analytics</h2>
      <p>Total Users: {users}</p>
      <p>Total Scores: {scores}</p>
    </div>
  );
}