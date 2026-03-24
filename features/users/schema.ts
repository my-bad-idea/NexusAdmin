import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be at most 50 characters'),
  email: z.string().email('Please enter a valid email'),
  department: z.string().min(1, 'Department is required'),
  role: z.enum(['Admin', 'Editor', 'Viewer']),
  status: z.enum(['Active', 'Inactive', 'Suspended']),
  tags: z.array(z.string()).optional(),
});

export type UserSchemaData = z.infer<typeof userSchema>;
