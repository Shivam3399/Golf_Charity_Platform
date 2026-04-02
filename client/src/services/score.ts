import { supabase } from '@/lib/supabase';

export const addScore = async (score: number, date: string) => {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) return;

  // Get existing scores
  const { data: scores } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  // If already 5 scores → delete oldest
  if (scores && scores.length >= 5) {
    await supabase
      .from('scores')
      .delete()
      .eq('id', scores[0].id);
  }

  // Insert new score
  return await supabase.from('scores').insert([
    {
      user_id: user.id,
      score,
      played_at: date,
    },
  ]);
};