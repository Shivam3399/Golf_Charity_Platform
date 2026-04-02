"use client";

import { useState } from "react";

export default function Draw() {
  const [numbers, setNumbers] = useState<number[]>([]);

  const runDraw = () => {
    const nums = Array.from({ length: 5 }, () =>
      Math.floor(Math.random() * 45) + 1
    );
    setNumbers(nums);
  };

  return (
    <div>
      <h2>🎯 Draw Management</h2>

      <button onClick={runDraw}>Run Draw</button>

      {numbers.length > 0 && (
        <p>Draw Numbers: {numbers.join(", ")}</p>
      )}
    </div>
  );
}