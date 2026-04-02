'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Success() {
  useEffect(() => {
    const saveSubscription = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) return;

      await supabase.from('subscriptions').insert([
        {
          user_id: user.id,
          status: 'active',
          amount: 10,
        },
      ]);
    };

    saveSubscription();
  }, []);

  return <h1>Payment Successful 🎉</h1>;
}