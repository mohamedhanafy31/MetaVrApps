import { z } from 'zod';

// User schemas
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string().min(1),
  passwordHash: z.string(),
  role: z.enum(['admin', 'moderator', 'user']),
  status: z.enum(['active', 'suspended', 'inactive']),
  trial: z.object({
    type: z.enum(['count', 'time', 'unlimited']),
    limit: z.number().nullable(),
    used: z.number(),
    startDate: z.date(),
    endDate: z.date().nullable(),
  }),
  metadata: z.object({
    company: z.string().optional(),
    jobTitle: z.string().optional(),
    phone: z.string().optional(),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastLoginAt: z.date().nullable(),
});

export const createUserSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(1),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
  role: z.enum(['admin', 'moderator', 'user']),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  phone: z.string().optional(),
  trial: z.object({
    type: z.enum(['count', 'time', 'unlimited']),
    limit: z.number().nullable(),
  }),
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true });

// Application schemas
export const applicationSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string(),
  platform: z.enum(['mobile', 'web', 'desktop']),
  status: z.enum(['active', 'inactive', 'maintenance']),
  authRequired: z.boolean(),
  maxConcurrentUsers: z.number().min(1),
  currentUsers: z.number().min(0),
  trialDefaults: z.object({
    type: z.enum(['count', 'time', 'unlimited']),
    limit: z.number().nullable(),
  }),
  iconUrl: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastHealthCheck: z.date().nullable(),
});

export const createApplicationSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  platform: z.enum(['mobile', 'web', 'desktop']),
  authRequired: z.boolean(),
  maxConcurrentUsers: z.number().min(1),
  trialDefaults: z.object({
    type: z.enum(['count', 'time', 'unlimited']),
    limit: z.number().nullable(),
  }),
});

export const updateApplicationSchema = createApplicationSchema.partial();

// Access Request schemas
export const accessRequestSchema = z.object({
  id: z.string(),
  fullName: z.string().min(1),
  email: z.string().email(),
  company: z.string().min(1),
  jobTitle: z.string().min(1),
  phone: z.string().nullable(),
  applicationId: z.string(),
  useCase: z.string().min(1),
  status: z.enum(['pending', 'approved', 'rejected']),
  createdAt: z.date(),
  processedAt: z.date().nullable(),
  processedBy: z.string().nullable(),
  notes: z.string().nullable(),
});

export const createAccessRequestSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  company: z.string().min(1),
  jobTitle: z.string().min(1),
  phone: z.string().optional(),
  applicationId: z.string(),
  useCase: z.string().min(1),
});

// Trial Preset schemas
export const trialPresetSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  type: z.enum(['count', 'time', 'unlimited']),
  limit: z.number().nullable(),
  description: z.string(),
  createdBy: z.string(),
  createdAt: z.date(),
});

export const createTrialPresetSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['count', 'time', 'unlimited']),
  limit: z.number().nullable(),
  description: z.string(),
});

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional(),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
});

export const confirmResetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
});

// API Response schemas
export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional(),
});

// Pagination schemas
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(25),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Filter schemas
export const userFiltersSchema = z.object({
  search: z.string().optional(),
  role: z.enum(['admin', 'moderator', 'user']).optional(),
  status: z.enum(['active', 'suspended', 'inactive']).optional(),
  trialType: z.enum(['count', 'time', 'unlimited']).optional(),
});

export const accessRequestFiltersSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  applicationId: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
});

// Type exports
export type User = z.infer<typeof userSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type Application = z.infer<typeof applicationSchema>;
export type CreateApplication = z.infer<typeof createApplicationSchema>;
export type UpdateApplication = z.infer<typeof updateApplicationSchema>;
export type AccessRequest = z.infer<typeof accessRequestSchema>;
export type CreateAccessRequest = z.infer<typeof createAccessRequestSchema>;
export type TrialPreset = z.infer<typeof trialPresetSchema>;
export type CreateTrialPreset = z.infer<typeof createTrialPresetSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
export type ConfirmResetPasswordData = z.infer<typeof confirmResetPasswordSchema>;
export type ApiResponse = z.infer<typeof apiResponseSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
export type UserFilters = z.infer<typeof userFiltersSchema>;
export type AccessRequestFilters = z.infer<typeof accessRequestFiltersSchema>;
