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

    // Get documents expiring in the next 30 days
    const { data: expiringDocs, error: expiringError } = await supabase
      .from('documents')
      .select('id,user_id,title,file_name,expiry_date')
      .gte('expiry_date', nowIso)
      .lte('expiry_date', plus30Iso);

    if (expiringError) throw new Error(`❌ Supabase query failed for expiring docs: ${expiringError.message}`);

    // Get already expired documents (expired within the last 7 days to avoid spam)
    const sevenDaysAgoIso = new Date(Date.now() - 7 * 86_400_000).toISOString();
    const { data: expiredDocs, error: expiredError } = await supabase
      .from('documents')
      .select('id,user_id,title,file_name,expiry_date')
      .gte('expiry_date', sevenDaysAgoIso)
      .lt('expiry_date', nowIso);

    if (expiredError) throw new Error(`❌ Supabase query failed for expired docs: ${expiredError.message}`);

    const allDocs = [...(expiringDocs || []), ...(expiredDocs || [])];

    if (!allDocs.length) {
      console.log('✅ No documents expiring soon or recently expired.');
      return;
    }

    const notifications = allDocs.map((doc: DocumentRow) => {
      const title = doc.title ?? doc.file_name;
      const expires_at = doc.expiry_date;

      if (!expires_at) return null;

      const expiryDate = new Date(expires_at);
      const now = new Date();
      const isExpired = expiryDate < now;
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      let notificationTitle: string;
      if (isExpired) {
        const daysExpired = Math.abs(daysUntilExpiry);
        if (daysExpired === 0) {
          notificationTitle = `⚠️ "${title}" has expired today`;
        } else if (daysExpired === 1) {
          notificationTitle = `⚠️ "${title}" expired yesterday`;
        } else {
          notificationTitle = `⚠️ "${title}" expired ${daysExpired} days ago`;
        }
      } else {
        if (daysUntilExpiry === 0) {
          notificationTitle = `🚨 "${title}" expires today`;
        } else if (daysUntilExpiry === 1) {
          notificationTitle = `🚨 "${title}" expires tomorrow`;
        } else if (daysUntilExpiry <= 7) {
          notificationTitle = `⚠️ "${title}" expires in ${daysUntilExpiry} days`;
        } else {
          notificationTitle = `Heads up! "${title}" expires in ${daysUntilExpiry} days`;
        }
      }

      return {
        user_id: doc.user_id,
        document_id: doc.id,
        title: notificationTitle,
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

    const expiringCount = expiringDocs?.length || 0;
    const expiredCount = expiredDocs?.length || 0;
    console.log(`✅ Processed ${notifications.length} notifications (${expiringCount} expiring, ${expiredCount} expired).`);
  },
};
