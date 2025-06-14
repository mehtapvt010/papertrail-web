import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getStorageUsageBytesServer, ONE_GIB } from '@/lib/storage/usage-server';
import { Settings, User, Shield, Database, Bell, Key, Trash2, Download, Upload, Sparkles, Zap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DeleteAccountButton from '@/components/settings/DeleteAccountButton';
import ExportDataButton from '@/components/settings/ExportDataButton';
import EditProfileDrawer from '@/components/settings/EditProfileDrawer';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  const usage = await getStorageUsageBytesServer(user.id);
  const quotaPct = +(usage / ONE_GIB * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-background to-primary/3" />
      <div className="absolute top-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-primary/3 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <Settings className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-xl text-muted-foreground">Manage your account and preferences</p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-8">
            {/* Account Settings */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
              <Card className="relative bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl shadow-xl">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                      <User className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-2xl font-semibold">Account Settings</CardTitle>
                  </div>
                  <p className="text-muted-foreground">Manage your personal information and account details</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                    <div>
                      <p className="font-medium">Email Address</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Shield className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                    <div>
                      <p className="font-medium">Account Status</p>
                      <p className="text-sm text-muted-foreground">Active • Verified</p>
                    </div>
                    <div className="h-8 w-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                  
                  <EditProfileDrawer />
                </CardContent>
              </Card>
            </div>

            {/* Storage Settings */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
              <Card className="relative bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl shadow-xl">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <Database className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-semibold">Storage & Usage</CardTitle>
                  </div>
                  <p className="text-muted-foreground">Monitor your storage usage and manage your documents</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Storage Used</span>
                      <span className="text-sm text-muted-foreground">
                        {(usage / (1024 * 1024 * 1024)).toFixed(2)} GB of 1 GB
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
                    <p className="text-sm text-muted-foreground">
                      {quotaPct}% of your storage quota used
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/30 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Upload className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-sm">Upload Speed</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">Fast</p>
                      <p className="text-xs text-muted-foreground">Optimized for large files</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Download className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-sm">Download Speed</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">Instant</p>
                      <p className="text-xs text-muted-foreground">No waiting time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Security Settings */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-green-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
              <Card className="relative bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl shadow-xl">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-semibold">Security & Privacy</CardTitle>
                  </div>
                  <p className="text-muted-foreground">Manage your security settings and privacy preferences</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-800 dark:text-green-200">Client-side Encryption</p>
                          <p className="text-sm text-green-700 dark:text-green-300">All documents encrypted before upload</p>
                        </div>
                      </div>
                      <div className="h-8 w-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Key className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium">Encryption Key</p>
                          <p className="text-sm text-muted-foreground">Managed automatically</p>
                        </div>
                      </div>
                      <div className="h-8 w-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <Zap className="h-4 w-4 text-blue-500" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
              <Card className="relative bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl shadow-xl">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ExportDataButton />
                  <Button className="w-full justify-start" variant="outline">
                    <Globe className="h-4 w-4 mr-2" />
                    Language Settings
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Danger Zone */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-red-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
              <Card className="relative bg-card/60 backdrop-blur-sm border border-red-500/20 rounded-2xl shadow-xl">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                      <Trash2 className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-red-600">Danger Zone</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground">Irreversible and destructive actions</p>
                </CardHeader>
                <CardContent>
                  <DeleteAccountButton />
                </CardContent>
              </Card>
            </div>

            {/* Account Info */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
              <Card className="relative bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl shadow-xl">
                <CardHeader className="pb-6">
                  <CardTitle className="text-xl font-semibold">Account Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Member Since</span>
                      <span className="text-sm font-medium">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Last Sign In</span>
                      <span className="text-sm font-medium">
                        {new Date(user.last_sign_in_at || user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Account Type</span>
                      <span className="text-sm font-medium text-primary">Free Plan</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-border/40 mt-16">
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              Enterprise Security
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="h-4 w-4" />
              Zero Knowledge
            </span>
            <span className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              GDPR Compliant
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
