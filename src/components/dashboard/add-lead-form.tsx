'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LeadFormValues, leadSchema } from '@/lib/validations'
import { 
  DESIGNATION_OPTIONS, 
  CALL_TYPE_OPTIONS, 
  RESPONSE_STATUS_OPTIONS 
} from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { LoadingSpinner } from '@/components/ui/loading'
import { useState } from 'react'

interface AddLeadFormProps {
  onSubmit: (data: LeadFormValues) => Promise<void>
  onCancel: () => void
}

export function AddLeadForm({ onSubmit, onCancel }: AddLeadFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      callType: 'FIRST_CALL',
      slotRequested: false,
      responseStatus: 'CALL_LATER',
    },
  })

  const slotRequested = watch('slotRequested')

  const handleFormSubmit = async (data: LeadFormValues) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      {/* College Name - Required */}
      <div className="space-y-2">
        <Label htmlFor="collegeName">
          College Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="collegeName"
          placeholder="Enter college name"
          {...register('collegeName')}
        />
        {errors.collegeName && (
          <p className="text-sm text-red-500">{errors.collegeName.message}</p>
        )}
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          placeholder="City / District"
          {...register('location')}
        />
      </div>

      {/* Contact Person */}
      <div className="space-y-2">
        <Label htmlFor="contactPerson">Contact Person</Label>
        <Input
          id="contactPerson"
          placeholder="Name of the contact"
          {...register('contactPerson')}
        />
      </div>

      {/* Designation & Phone - Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="designation">Designation</Label>
          <Select
            id="designation"
            options={DESIGNATION_OPTIONS}
            placeholder="Select..."
            {...register('designation')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="Phone number"
            {...register('phone')}
          />
        </div>
      </div>

      {/* Call Type */}
      <div className="space-y-2">
        <Label htmlFor="callType">Call Type</Label>
        <Select
          id="callType"
          options={CALL_TYPE_OPTIONS}
          {...register('callType')}
        />
      </div>

      {/* Response Status */}
      <div className="space-y-2">
        <Label htmlFor="responseStatus">
          Response <span className="text-red-500">*</span>
        </Label>
        <Select
          id="responseStatus"
          options={RESPONSE_STATUS_OPTIONS}
          {...register('responseStatus')}
        />
      </div>

      {/* Slot Requested Toggle */}
      <div className="flex items-center justify-between py-2">
        <Label htmlFor="slotRequested" className="cursor-pointer">
          Slot Requested?
        </Label>
        <Switch
          id="slotRequested"
          checked={slotRequested}
          onCheckedChange={(checked) => {
            setValue('slotRequested', checked)
            if (!checked) {
              setValue('slotDate', undefined)
            }
          }}
        />
      </div>

      {/* Slot Date - Conditional */}
      {slotRequested && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <Label htmlFor="slotDate">
            Slot Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="slotDate"
            type="date"
            {...register('slotDate')}
          />
          {errors.slotDate && (
            <p className="text-sm text-red-500">{errors.slotDate.message}</p>
          )}
        </div>
      )}

      {/* Remarks */}
      <div className="space-y-2">
        <Label htmlFor="remarks">Remarks / Notes</Label>
        <Textarea
          id="remarks"
          placeholder="Any additional notes..."
          rows={3}
          {...register('remarks')}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="flex-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" className="text-white" />
              Saving...
            </>
          ) : (
            'Save Lead'
          )}
        </Button>
      </div>
    </form>
  )
}
