'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export default function DeleteCourseButton({ courseId, courseTitle }: { courseId: string, courseTitle: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete() {
    const confirmDelete = confirm(`CRITICAL ACTION: Are you sure you want to delete "${courseTitle}"? All associated lessons will be permanently wiped from the registry.`)
    
    if (!confirmDelete) return

    setIsDeleting(true)

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId)

    if (error) {
      alert(`SYSTEM ERROR: ${error.message}`)
      setIsDeleting(false)
    } else {
      router.refresh()
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="border-2 border-black px-4 py-2 text-[10px] font-black uppercase hover:bg-red-600 hover:text-white hover:border-red-600 transition-all text-red-600 disabled:opacity-50 flex items-center gap-2"
    >
      {isDeleting ? 'DELETING...' : 'Delete'}
    </button>
  )
}