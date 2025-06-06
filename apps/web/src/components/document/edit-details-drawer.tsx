'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useSupabaseClient } from '@/hooks/useSupabaseClient'
import type { Database } from '@/lib/supabase/types'

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
  const supabase = useSupabaseClient()

  const save = async () => {
    await supabase.from('documents')
      .update({ title, expiry_date: expiry || null })
      .eq('id', doc.id)
    onOpenChange(false)
    refresh()
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader><SheetTitle>Edit details</SheetTitle></SheetHeader>
        <div className="py-4 space-y-3">
          <label className="block text-sm font-medium">Title</label>
          <Input value={title} onChange={e => setTitle(e.target.value)} />

          <label className="block text-sm font-medium">Expiry (YYYY-MM-DD)</label>
          <Input value={expiry} onChange={e => setExpiry(e.target.value)} />

          <Button onClick={save} className="w-full mt-4">Save</Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
