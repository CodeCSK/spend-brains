import { z } from 'zod'

import { EVENT_TYPES, EVENT_VISIBILITIES } from '../../../types/event'

export const eventFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Event name is required')
      .max(200, 'Name must be at most 200 characters'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    description: z
      .string()
      .max(2000, 'Description must be at most 2000 characters')
      .optional(),
    location: z
      .string()
      .max(300, 'Location must be at most 300 characters')
      .optional(),
    eventType: z.enum(EVENT_TYPES),
    visibility: z.enum(EVENT_VISIBILITIES),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'End date must be on or after start date',
    path: ['endDate'],
  })

export type EventFormValues = z.infer<typeof eventFormSchema>
