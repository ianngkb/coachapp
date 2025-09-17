import { z } from 'zod'

// Sign up form schema
export const SignUpSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters'),
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters'),
  user_type: z.enum(['student', 'coach'], {
    required_error: 'Please select your role'
  }),
  terms: z
    .boolean()
    .refine(val => val === true, {
      message: 'You must accept the terms and conditions'
    })
})

// Sign in form schema
export const SignInSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
})

// Precreate user API schema
export const PreCreateUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  first_name: z.string().min(1, 'First name is required').optional(),
  last_name: z.string().min(1, 'Last name is required').optional(),
  user_type: z.enum(['student', 'coach']).optional()
})

// Type exports for forms
export type SignUpFormData = z.infer<typeof SignUpSchema>
export type SignInFormData = z.infer<typeof SignInSchema>
export type PreCreateUserData = z.infer<typeof PreCreateUserSchema>