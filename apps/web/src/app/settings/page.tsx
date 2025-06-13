/* eslint-disable @next/next/no-img-element */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getStorageUsageBytesServer, ONE_GIB, QUOTA_SOFT_LIMIT } from '@/lib/storage/usage-server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { downloadAndDecryptAll } from '@/lib/export/exporter';
import OpenAIPreference from '@/components/settings/OpenAIPreference';
import PlausiblePreference from '@/components/settings/PlausiblePreference';
import DeleteAccountButton from '@/components/settings/DeleteAccountButton';
import ExportDataButton from '@/components/settings/ExportDataButton';
import { User, HardDrive, Key, Shield, Download, Trash2, Settings } from 'lucide-react';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  const usage = await getStorageUsageBytesServer(user.id);
  const quotaPct = +(usage / ONE_GIB * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Settings</h1>
              <p className="text-xl text-muted-foreground">Manage your account and preferences</p>
            </div>
          </div>
        </section>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Section */}
          <Card className="card-hover">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Profile</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Email Address</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <DeleteAccountButton />
            </CardContent>
          </Card>

          {/* Storage Section */}
          <Card className="card-hover">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <HardDrive className="h-5 w-5 text-green-600" />
                </div>
                <CardTitle className="text-xl">Storage</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Storage Used</span>
                  <span className="text-sm text-muted-foreground">
                    {(usage / 1_048_576).toFixed(1)} MB / 1024 MB
                  </span>
                </div>
                <div className="w-full bg-muted h-3 rounded-xl overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      quotaPct > 90 
                        ? 'bg-red-500' 
                        : quotaPct > 75 
                        ? 'bg-orange-500' 
                        : 'bg-primary'
                    }`}
                    style={{ width: `${quotaPct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Usage</span>
                  <span className={`text-sm font-medium ${
                    quotaPct > 90 
                      ? 'text-red-600' 
                      : quotaPct > 75 
                      ? 'text-orange-600' 
                      : 'text-primary'
                  }`}>
                    {quotaPct}%
                  </span>
                </div>
              </div>
              
              {quotaPct > 90 && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    ⚠️ Storage quota nearly exceeded. Consider deleting some documents or upgrading your plan.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* API Keys Section */}
          <Card className="card-hover">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <Key className="h-5 w-5 text-purple-600" />
                </div>
                <CardTitle className="text-xl">AI Provider</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <OpenAIPreference />
            </CardContent>
          </Card>

          {/* Privacy Section */}
          <Card className="card-hover">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <Shield className="h-5 w-5 text-orange-600" />
                </div>
                <CardTitle className="text-xl">Privacy & Analytics</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <PlausiblePreference />
            </CardContent>
          </Card>

          {/* Export Section */}
          <Card className="card-hover">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <Download className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Data Export</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ExportDataButton />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
