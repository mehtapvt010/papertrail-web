import { Octokit } from 'octokit';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

const gh = new Octokit({ auth: GITHUB_TOKEN });

export default {
  async scheduled(_: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    // 1️⃣ Fetch KPI data from view
    const { data, error } = await supabase.from('admin_uploads_per_day').select('*');
    if (error) throw error;

    // 2️⃣ Format CSV
    const csv = 'day,uploads\n' + (data as [{ day: string; uploads: number }]).map(d => `${d.day},${d.uploads}`).join('\n');
    const today = new Date().toISOString().split('T')[0];

    // 3️⃣ Push CSV into GitHub
    await gh.rest.repos.createOrUpdateFileContents({
      owner: 'YOUR_GH_USER',    // 🔥 UPDATE
      repo: 'papertrail-backups',  // 🔥 UPDATE
      path: `uploads/${today}.csv`,
      message: `daily backup ${today}`,
      content: btoa(csv),
    });
  },
};
