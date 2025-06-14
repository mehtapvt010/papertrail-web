'use client';

import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { User, Save, Loader2, Edit3 } from 'lucide-react';
import { toast } from 'sonner';

export default function EditProfileDrawer() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const supabase = useSupabaseClient();
  const { session } = useSessionContext();

  useEffect(() => {
    if (open && session?.user) {
      fetchUserProfile();
    }
  }, [open, session]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('name')
        .eq('id', session?.user.id)
        .single();

      if (!error && data) {
        setName(data.name || '');
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSave = async () => {
    if (!session?.user) {
      toast.error('Not authenticated');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: session.user.id,
          name: name.trim(),
          email: session.user.email,
        }, {
          onConflict: 'id',
        });

      if (error) {
        toast.error('Failed to update profile');
        return;
      }

      toast.success('Profile updated successfully');
      setOpen(false);
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && loading) return; // Prevent closing while saving
    setOpen(open);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button className="w-full" variant="outline">
          <User className="h-4 w-4 mr-2" />
          Edit Profile Details
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader className="space-y-1 pb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Edit3 className="h-4 w-4 text-primary-foreground" />
            </div>
            <SheetTitle className="text-xl">Edit Profile Details</SheetTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Update your personal information
          </p>
        </SheetHeader>
        
        <div className="space-y-6">
          {initialLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="text-muted-foreground">Loading profile...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                <Input 
                  id="name"
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="Enter your full name"
                  disabled={loading}
                  className="transition-all focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-xs text-muted-foreground">
                  This name will be displayed throughout the application
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={loading || !name.trim()}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
} 