import { supabase } from "@/lib/supabase";

let drawCounter = 0;

// Random targets
let target3 = Math.floor(Math.random() * 5) + 5;
let target4 = Math.floor(Math.random() * 10) + 10;
let target5 = Math.floor(Math.random() * 20) + 20;

// Generate unique random numbers (1–45)
const generateDrawNumbers = () => {
  const numbers = new Set<number>();

  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }

  return Array.from(numbers);
};

// Ensure uniqueness
const mergeUnique = (base: number[], extra: number[], count: number) => {
  const set = new Set(base);

  for (let num of extra) {
    if (set.size >= count) break;
    set.add(num);
  }

  return Array.from(set).slice(0, count);
};

export const runDraw = async () => {
  try {
    drawCounter++;

    console.log("Draw Count:", drawCounter);

    let drawNumbers = generateDrawNumbers();

    const { data: scores } = await supabase.from("scores").select("*");
    if (!scores || scores.length === 0) return;

    const userMap: any = {};
    scores.forEach((s) => {
      if (!userMap[s.user_id]) userMap[s.user_id] = [];
      userMap[s.user_id].push(s.score);
    });

    const users = Object.keys(userMap);

    // 🎯 FORCE MATCH LOGIC
    if (users.length > 0) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const userScores = userMap[randomUser];

      if (userScores.length >= 5) {
        if (drawCounter === target3) {
          console.log("🎯 Triggering 3-match");
          drawNumbers = mergeUnique(
            userScores.slice(0, 3),
            generateDrawNumbers(),
            5,
          );
        }

        if (drawCounter === target4) {
          console.log("🎯 Triggering 4-match");
          drawNumbers = mergeUnique(
            userScores.slice(0, 4),
            generateDrawNumbers(),
            5,
          );
        }

        if (drawCounter === target5) {
          console.log("🏆 Jackpot Triggered");
          drawNumbers = userScores.slice(0, 5);
        }
      }
    }

    console.log("Final Draw Numbers:", drawNumbers);

    // Save draw
    const { data: draw } = await supabase
      .from("draws")
      .insert([
        {
          numbers: drawNumbers,
          draw_number: drawCounter,
          is_published: false,
        },
      ])
      .select()
      .single();

    if (!draw) throw new Error("Draw not created");

    // Calculate winners
    for (const userId in userMap) {
      const userScores = userMap[userId];

      const matchCount = userScores.filter((s: number) =>
        drawNumbers.includes(s),
      ).length;

      console.log(`User ${userId} matches:`, matchCount);

      if (matchCount >= 3) {
        await supabase.from("winners").insert([
          {
            user_id: userId,
            match_count: matchCount,
            draw_id: draw.id,
          },
        ]);
      }
    }

    // 💰 Calculate prizes
    await calculatePrizes(draw.id);

    // 🔁 Reset cycle after jackpot
    if (drawCounter >= target5) {
      console.log("🔄 Resetting draw cycle");

      drawCounter = 0;
      target3 = Math.floor(Math.random() * 5) + 5;
      target4 = Math.floor(Math.random() * 10) + 10;
      target5 = Math.floor(Math.random() * 20) + 20;
    }

    return drawNumbers;
  } catch (err) {
    console.error("Draw Error:", err);
  }
};

// 💰 PRIZE LOGIC
const calculatePrizes = async (drawId: string) => {
  try {
    const { data: winners } = await supabase
      .from("winners")
      .select("*")
      .eq("draw_id", drawId);

    if (!winners) return;

    // ✅ REAL POOL FROM SUBSCRIPTIONS
    const { data: subs } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("status", "active");

    const totalUsers = subs?.length || 0;
    const subscriptionAmount = 10;

    const totalPool = totalUsers * subscriptionAmount;

    console.log("Total Users:", totalUsers);
    console.log("Total Pool:", totalPool);

    // Get previous jackpot
    const { data: prevDraws } = await supabase
      .from("draws")
      .select("jackpot_pool")
      .neq("id", drawId)
      .order("created_at", { ascending: false })
      .limit(1);

    let previousJackpot = prevDraws?.[0]?.jackpot_pool || 0;

    const pool = {
      5: totalPool * 0.4 + previousJackpot,
      4: totalPool * 0.35,
      3: totalPool * 0.25,
    };

    const groups: any = { 3: [], 4: [], 5: [] };

    winners.forEach((w) => {
      if (w.match_count >= 3) {
        groups[w.match_count].push(w);
      }
    });

    // 🏆 5 MATCH (WITH ROLLOVER)
    if (groups[5].length > 0) {
      const prize = pool[5] / groups[5].length;

      for (const winner of groups[5]) {
        await supabase
          .from("winners")
          .update({ prize_amount: prize })
          .eq("id", winner.id);
      }

      await supabase.from("draws").update({ jackpot_pool: 0 }).eq("id", drawId);

      console.log("🏆 Jackpot distributed");
    } else {
      await supabase
        .from("draws")
        .update({ jackpot_pool: pool[5] })
        .eq("id", drawId);

      console.log("🔁 Jackpot rolled over:", pool[5]);
    }

    // 🎯 4 MATCH
    if (groups[4].length > 0) {
      const prize = pool[4] / groups[4].length;

      for (const winner of groups[4]) {
        await supabase
          .from("winners")
          .update({ prize_amount: prize })
          .eq("id", winner.id);
      }
    }

    // 🎉 3 MATCH
    if (groups[3].length > 0) {
      const prize = pool[3] / groups[3].length;

      for (const winner of groups[3]) {
        await supabase
          .from("winners")
          .update({ prize_amount: prize })
          .eq("id", winner.id);
      }
    }
  } catch (err) {
    console.error("Prize Error:", err);
  }
};
