import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const leadSchema = z.object({
  collegeName: z.string().min(1, 'College name is required'),
  location: z.string().optional(),
  contactPerson: z.string().optional(),
  designation: z.enum(['PRINCIPAL', 'VICE_PRINCIPAL', 'PLACEMENT_OFFICER', 'CSR_COORDINATOR', 'OTHER']).optional(),
  phone: z.string().optional(),
  callType: z.enum(['FIRST_CALL', 'FOLLOW_UP']),
  slotRequested: z.boolean(),
  slotDate: z.string().optional(),
  responseStatus: z.enum(['INTERESTED', 'CALL_LATER', 'NOT_INTERESTED']),
  remarks: z.string().optional(),
}).refine((data) => {
  // If slot is requested, slot date must be provided
  if (data.slotRequested && !data.slotDate) {
    return false
  }
  return true
}, {
  message: 'Slot date is required when slot is requested',
  path: ['slotDate'],
})

export type LeadFormValues = z.infer<typeof leadSchema>
