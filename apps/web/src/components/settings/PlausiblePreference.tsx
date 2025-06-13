'use client';

import { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Shield, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function PlausiblePreference() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('plausible_ignore');
    setEnabled(!stored);
  }, []);

  const handleChange = (checked: boolean) => {
    if (checked) {
      delete localStorage.plausible_ignore;
      setEnabled(true);
      toast.success('Analytics enabled. Reload the page for changes to take effect.');
    } else {
      localStorage.plausible_ignore = 'true';
      setEnabled(false);
      toast.success('Analytics disabled. Reload the page for changes to take effect.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Analytics & Privacy</h3>
          <p className="text-sm text-muted-foreground">
            Control how your usage data is collected for improving the service
          </p>
        </div>
        <Switch checked={enabled} onCheckedChange={handleChange} />
      </div>

      {enabled ? (
        <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Analytics Enabled
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Anonymous usage data helps us improve PaperTrail. No personal information is collected.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                Analytics Disabled
              </p>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                No usage data will be collected. You may miss out on performance insights.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="p-3 bg-muted/30 rounded-lg">
        <div className="flex items-start gap-3">
          <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-1">Privacy First</p>
            <p>
              We use Plausible Analytics, which is privacy-focused and GDPR compliant. 
              No cookies, no personal data collection, and no cross-site tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
