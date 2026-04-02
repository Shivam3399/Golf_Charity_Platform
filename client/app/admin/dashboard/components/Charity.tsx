"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Charity() {
  const [charities, setCharities] = useState<any[]>([]);
  const [name, setName] = useState("");

  const fetchCharities = async () => {
    const { data } = await supabase.from("charities").select("*");
    setCharities(data || []);
  };

  useEffect(() => {
    fetchCharities();
  }, []);

  const addCharity = async () => {
    await supabase.from("charities").insert([{ name }]);
    setName("");
    fetchCharities();
  };

  return (
    <div>
      <h2>❤️ Charity Management</h2>

      <input
        placeholder="Charity name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={addCharity}>Add</button>

      {charities.map((c) => (
        <p key={c.id}>{c.name}</p>
      ))}
    </div>
  );
}