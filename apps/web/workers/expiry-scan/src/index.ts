import { createClient } from '@supabase/supabase-js';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

type DocumentRow = {
  id: string;
  user_id: string;
  title: string | null;
  file_name: string;
  expiry_date: string | null;
};

export default {
  async fetch() {
    return new Response('📡 Expiry-scan worker alive!');
  },

  async scheduled(_event: ScheduledEvent, env: Env) {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const nowIso = new Date().toISOString();
    const plus30Iso = new Date(Date.now() + 30 * 86_400_000).toISOString();

    const { data: docs, error } = await supabase
      .from('documents')
      .select('id,user_id,title,file_name,expiry_date')
      .gte('expiry_date', nowIso)
      .lte('expiry_date', plus30Iso);

    if (error) throw new Error(`❌ Supabase query failed: ${error.message}`);
    if (!docs?.length) {
      console.log('✅ No documents expiring in next 30 days.');
      return;
    }

    const notifications = docs.map((doc: DocumentRow) => {
      const title = doc.title ?? doc.file_name;
      const expires_at = doc.expiry_date;

      if (!expires_at) return null;

      return {
        user_id: doc.user_id,
        document_id: doc.id,
        title: `Heads up! "${title}" expires soon`,
        expires_at,
      };
    }).filter(Boolean); // remove nulls if expiry_date was missing

    if (!notifications.length) {
      console.log('⚠️ No valid documents with expiry_date to notify.');
      return;
    }

    const { error: insertErr } = await supabase
      .from('notifications')
      .upsert(notifications); // No onConflict supported — ensure constraint is in DB

    if (insertErr) {
      throw new Error(`❌ Upsert notifications failed: ${insertErr.message}`);
    }

    console.log(`✅ Processed ${notifications.length} notifications.`);
  },
};
