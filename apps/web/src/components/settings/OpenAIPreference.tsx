'use client';

import { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Key, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function OpenAIPreference() {
  const [enabled, setEnabled] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [key, setKey] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem('openai_key');
    if (storedKey) {
      setEnabled(true);
      setKey(storedKey);
    }
  }, []);

  const handleToggle = (checked: boolean) => {
    if (checked) {
      setIsEditing(true);
    } else {
      localStorage.removeItem('openai_key');
      setEnabled(false);
      setKey('');
      toast.success('OpenAI key removed');
    }
  };

  const handleSaveKey = () => {
    if (key.trim()) {
      localStorage.setItem('openai_key', key.trim());
      setEnabled(true);
      setIsEditing(false);
      toast.success('OpenAI key saved successfully');
    } else {
      toast.error('Please enter a valid API key');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (!enabled) {
      setKey('');
    }
  };

  const maskedKey = key ? `${key.substring(0, 8)}...${key.substring(key.length - 4)}` : '';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">OpenAI API Key</h3>
          <p className="text-sm text-muted-foreground">
            Use your own OpenAI API key for enhanced AI capabilities
          </p>
        </div>
        <Switch checked={enabled} onCheckedChange={handleToggle} />
      </div>

      {enabled && !isEditing && (
        <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                OpenAI API Key Configured
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                {showKey ? key : maskedKey}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
            </div>
          </div>
        </div>
      )}

      {isEditing && (
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Enter OpenAI API Key
              </span>
            </div>
            <Input
              type="password"
              placeholder="sk-..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="font-mono"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveKey}>
                Save Key
              </Button>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {!enabled && !isEditing && (
        <div className="p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Using default Zephyr 7B model. Enable OpenAI for enhanced performance.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
