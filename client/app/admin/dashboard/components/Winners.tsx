"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Winners() {
  const [winners, setWinners] = useState<any[]>([]);

  const fetchWinners = async () => {
    const { data } = await supabase.from("winners").select("*");
    setWinners(data || []);
  };

  useEffect(() => {
    fetchWinners();
  }, []);

  return (
    <div>
      <h2>🏆 Winners Management</h2>

      {winners.map((w) => (
        <div key={w.id}>
          <p>User: {w.user_id}</p>
          <p>Match: {w.match_count}</p>
          <p>Status: {w.status || "Pending"}</p>
        </div>
      ))}
    </div>
  );
}