import { z } from 'zod';
import { OptionType, QuestionCategory, QuestionDifficulty } from '@prisma/client';

export const candidateRegisterSchema = z.object({
  fullName: z
    .string({ required_error: 'Full Name is required' })
    .trim()
    .min(2, 'Full Name must be at least 2 characters')
    .max(50, 'Full Name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Full Name can only contain letters and spaces'),
  email: z
    .string({ required_error: 'Email ID is required' })
    .trim()
    .toLowerCase()
    .email('Invalid email address format'),
  age: z.coerce
    .number({ required_error: 'Age is required' })
    .int('Age must be an integer')
    .min(18, 'Minimum age is 18')
    .max(60, 'Maximum age is 60'),
  phoneNumber: z
    .string({ required_error: 'Phone Number is required' })
    .trim()
    .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  gender: z.string().trim().optional().nullable(),
  highestQualification: z
    .string({ required_error: 'Highest Qualification is required' })
    .trim()
    .min(1, 'Highest Qualification is required'),
  city: z.string().trim().optional().nullable(),
});

export const startAssessmentSchema = z.object({
  candidateId: z.string().uuid('Invalid candidate ID format'),
});

export const submitAnswerSchema = z.object({
  questionOrderIndex: z.number().int().min(1).max(10),
  selectedOption: z.nativeEnum(OptionType).nullable(),
});

export const markReviewSchema = z.object({
  questionOrderIndex: z.number().int().min(1).max(10),
  isMarkedForReview: z.boolean(),
});

export const adminLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const questionCreateUpdateSchema = z.object({
  text: z.string().trim().min(5, 'Question text must be at least 5 characters'),
  optionA: z.string().trim().min(1, 'Option A is required'),
  optionB: z.string().trim().min(1, 'Option B is required'),
  optionC: z.string().trim().min(1, 'Option C is required'),
  optionD: z.string().trim().min(1, 'Option D is required'),
  correctOption: z.nativeEnum(OptionType, { errorMap: () => ({ message: 'Correct option must be A, B, C, or D' }) }),
  category: z.nativeEnum(QuestionCategory, { errorMap: () => ({ message: 'Category must be QUANTITATIVE, LOGICAL_REASONING, or VERBAL' }) }),
  difficulty: z.nativeEnum(QuestionDifficulty, { errorMap: () => ({ message: 'Difficulty must be EASY, MEDIUM, or HARD' }) }),
  explanation: z.string().trim().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const testSettingSchema = z.object({
  durationMinutes: z.coerce.number().int().min(1, 'Duration must be at least 1 minute').max(180, 'Duration cannot exceed 180 minutes'),
  passPercentage: z.coerce.number().min(0, 'Pass percentage cannot be negative').max(100, 'Pass percentage cannot exceed 100%'),
});
