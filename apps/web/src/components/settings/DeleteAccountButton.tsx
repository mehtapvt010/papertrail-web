'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { Trash2, AlertTriangle, X, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function DeleteAccountButton() {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const supabase = supabaseBrowser();

  const handleDelete = async () => {
    if (confirmationText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch('/api/delete-account', { method: 'POST' });
      
      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      await supabase.auth.signOut();
      toast.success('Account deleted successfully');
      location.href = '/';
    } catch (error) {
      console.error('Delete account error:', error);
      toast.error('Failed to delete account. Please try again.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {!showConfirmation ? (
        <Button 
          variant="destructive" 
          onClick={() => setShowConfirmation(true)}
          className="w-full sm:w-auto"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Account
        </Button>
      ) : (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <h4 className="font-medium text-red-800 dark:text-red-200">
                  Delete Account
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  This action is irreversible and will permanently delete all your data.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-red-100 dark:bg-red-950/40 rounded-lg">
                <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                  What will be deleted:
                </p>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  <li>• All your uploaded documents</li>
                  <li>• Document metadata and search indexes</li>
                  <li>• Account settings and preferences</li>
                  <li>• All associated data and files</li>
                </ul>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-red-800 dark:text-red-200">
                  Type &quot;DELETE&quot; to confirm:
                </label>
                <Input
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder="DELETE"
                  className="border-red-300 dark:border-red-700"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={confirmationText !== 'DELETE' || isDeleting}
                  className="flex-1"
                >
                  {isDeleting ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Permanently Delete Account
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowConfirmation(false);
                    setConfirmationText('');
                  }}
                  disabled={isDeleting}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
