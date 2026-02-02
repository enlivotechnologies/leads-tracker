'use client'

import { useRef, useEffect } from 'react'
import { cn, isToday, formatDate } from '@/lib/utils'
import { addDays, subDays, startOfDay } from 'date-fns'

interface DateSelectorProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
}

export function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const today = startOfDay(new Date())
  
  // Generate dates: 30 days before and 7 days after today
  const dates = Array.from({ length: 38 }, (_, i) => subDays(today, 30 - i))

  useEffect(() => {
    // Scroll to selected date on mount
    if (scrollRef.current) {
      const selectedElement = scrollRef.current.querySelector('[data-selected="true"]')
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      }
    }
  }, [])

  const handleDateClick = (date: Date) => {
    onDateChange(date)
  }

  return (
    <div className="w-full overflow-hidden">
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {dates.map((date, index) => {
          const isSelected = date.getTime() === startOfDay(selectedDate).getTime()
          const isTodayDate = isToday(date)
          const isPast = date < today

          return (
            <button
              key={index}
              data-selected={isSelected}
              onClick={() => handleDateClick(date)}
              className={cn(
                'flex flex-col items-center justify-center min-w-[56px] py-2 px-3 rounded-xl transition-all snap-center',
                isSelected
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : isPast
                  ? 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              )}
            >
              <span className="text-[10px] uppercase font-medium opacity-70">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <span className={cn('text-lg font-semibold', isTodayDate && !isSelected && 'text-primary')}>
                {date.getDate()}
              </span>
              {isTodayDate && (
                <div
                  className={cn(
                    'w-1.5 h-1.5 rounded-full mt-0.5',
                    isSelected ? 'bg-white' : 'bg-primary'
                  )}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
