import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function fixDebt() {
  const userId = 'd2e64165-fc59-4fbe-bb77-b60513cc5d50';
  
  // We will rename their oldest 21 "_purchased" sessions to not have "_purchased"
  // Actually, we can just fetch all their "_purchased" sessions
  const { data: sessions } = await supabase
    .from('ai_sessions')
    .select('id, session_type')
    .eq('user_id', userId)
    .like('session_type', '%_purchased');

  if (!sessions) return;

  console.log(`Found ${sessions.length} purchased sessions to fix.`);

  for (const session of sessions) {
    const newType = session.session_type.replace('_purchased', '');
    await supabase
      .from('ai_sessions')
      .update({ session_type: newType })
      .eq('id', session.id);
  }

  console.log("Fixed user debt.");
}

fixDebt();
