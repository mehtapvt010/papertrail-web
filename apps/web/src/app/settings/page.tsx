/* eslint-disable @next/next/no-img-element */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getStorageUsageBytesServer, ONE_GIB, QUOTA_SOFT_LIMIT } from '@/lib/storage/usage-server';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { downloadAndDecryptAll } from '@/lib/export/exporter';
import OpenAIPreference from '@/components/settings/OpenAIPreference';
import PlausiblePreference from '@/components/settings/PlausiblePreference';
import DeleteAccountButton from '@/components/settings/DeleteAccountButton';
import ExportDataButton from '@/components/settings/ExportDataButton';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  const usage = await getStorageUsageBytesServer(user.id);
  const quotaPct = +(usage / ONE_GIB * 100).toFixed(1);

  return (
    <main className="max-w-3xl mx-auto space-y-8 py-12">
      {/* PROFILE */}
      <Card>
        <CardContent className="space-y-2 py-6">
          <h2 className="text-lg font-semibold">Profile</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <DeleteAccountButton />
        </CardContent>
      </Card>

      {/* QUOTA */}
      <Card>
        <CardContent className="space-y-4 py-6">
          <h2 className="text-lg font-semibold">Storage</h2>
          <div className="w-full bg-muted h-3 rounded-xl overflow-hidden">
            <div
              className={`h-full ${quotaPct > 90 ? 'bg-destructive' : 'bg-primary'}`}
              style={{ width: `${quotaPct}%` }}
            />
          </div>
          <p className="text-sm">
            {(usage / 1_048_576).toFixed(1)} MB / 1024 MB ({quotaPct} %)
          </p>
        </CardContent>
      </Card>

      {/* API KEYS */}
      <Card>
        <CardContent className="space-y-4 py-6">
          <h2 className="text-lg font-semibold">LLM Provider</h2>
          <OpenAIPreference />
        </CardContent>
      </Card>


      {/* PRIVACY */}
      <Card>
        <CardContent className="space-y-4 py-6">
          <h2 className="text-lg font-semibold">Analytics privacy</h2>
          <PlausiblePreference />
        </CardContent>
      </Card>

      {/* EXPORT */}
      <Card>
        <CardContent className="space-y-4 py-6">
          <h2 className="text-lg font-semibold">Data export</h2>
          <ExportDataButton />
        </CardContent>
      </Card>
    </main>
  );
}
