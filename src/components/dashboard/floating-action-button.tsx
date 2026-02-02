'use client'

import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FloatingActionButtonProps {
  onClick: () => void
  disabled?: boolean
}

export function FloatingActionButton({ onClick, disabled }: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'fixed bottom-6 right-6 z-40',
        'flex h-14 w-14 items-center justify-center',
        'rounded-full bg-primary text-white shadow-lg shadow-primary/30',
        'transition-all active:scale-95',
        'hover:shadow-xl hover:shadow-primary/40',
        'disabled:opacity-50 disabled:cursor-not-allowed'
      )}
      aria-label="Add new lead"
    >
      <Plus className="h-6 w-6" />
    </button>
  )
}
