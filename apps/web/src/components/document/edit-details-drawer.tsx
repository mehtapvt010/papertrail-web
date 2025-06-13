'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useSupabaseClient } from '@/hooks/useSupabaseClient'
import type { Database } from '@/lib/supabase/types'
import { Edit3, Save, Calendar, FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type DocRow = Database['public']['Tables']['documents']['Row']

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  doc: Partial<DocRow>
  refresh: () => void
}

export default function EditDetailsDrawer({ open, onOpenChange, doc, refresh }: Props) {
  const [title, setTitle] = useState(doc.title ?? '')
  const [expiry, setExpiry] = useState(doc.expiry_date ?? '')
  const [loading, setLoading] = useState(false)
  const supabase = useSupabaseClient()

  const save = async () => {
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.from('documents')
        .update({ 
          title: title.trim(), 
          expiry_date: expiry || null 
        })
        .eq('id', doc.id)
      
      if (error) {
        toast.error('Failed to update document')
        return
      }

      toast.success('Document updated successfully')
      onOpenChange(false)
      refresh()
    } catch (err) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open && loading) return // Prevent closing while saving
    onOpenChange(open)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader className="space-y-1 pb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Edit3 className="h-4 w-4 text-primary-foreground" />
            </div>
            <SheetTitle className="text-xl">Edit Document Details</SheetTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Update the title and expiry date for this document
          </p>
        </SheetHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Document Title
            </Label>
            <Input 
              id="title"
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="Enter document title"
              disabled={loading}
              className="transition-all focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiry" className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Expiry Date
            </Label>
            <Input 
              id="expiry"
              type="date" 
              value={expiry} 
              onChange={e => setExpiry(e.target.value)} 
              disabled={loading}
              className="transition-all focus:ring-2 focus:ring-primary/20"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty for no expiry date
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
              onClick={save} 
              disabled={loading || !title.trim()}
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
        </div>
      </SheetContent>
    </Sheet>
  )
}
