'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'

export default function DeleteCourseButton({ courseId, courseTitle }: { courseId: string, courseTitle: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete() {
    // Professional confirmation phrasing
    const confirmDelete = confirm(
      `Confirm Deletion: Are you sure you want to remove "${courseTitle}"? \n\nThis action will permanently delete all associated modules and student progress records. This cannot be undone.`
    )
    
    if (!confirmDelete) return

    setIsDeleting(true)

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId)

    if (error) {
      alert(`Access Error: ${error.message}`)
      setIsDeleting(false)
    } else {
      router.refresh()
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all flex items-center justify-center disabled:opacity-50"
      title="Delete Course"
    >
      {isDeleting ? (
        <Loader2 size={18} className="animate-spin text-slate-400" />
      ) : (
        <Trash2 size={18} />
      )}
    </button>
  )
}