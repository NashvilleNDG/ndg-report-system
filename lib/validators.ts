import { z } from "zod";

export const createClientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, hyphens"),
  industry: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  logoUrl: z.string().url().optional().or(z.literal("")),
});

export const updateClientSchema = createClientSchema.partial();

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "TEAM", "CLIENT"]),
  clientId: z.string().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(["ADMIN", "TEAM", "CLIENT"]).optional(),
  clientId: z.string().nullable().optional(),
});

export const reportDataSchema = z.object({
  instagram: z
    .object({
      followers: z.number().nullable().optional(),
      followersChange: z.number().nullable().optional(),
      likes: z.number().nullable().optional(),
      reach: z.number().nullable().optional(),
      impressions: z.number().nullable().optional(),
      engagement: z.number().nullable().optional(),
    })
    .optional(),
  facebook: z
    .object({
      followers: z.number().nullable().optional(),
      followersChange: z.number().nullable().optional(),
      likes: z.number().nullable().optional(),
      reach: z.number().nullable().optional(),
      impressions: z.number().nullable().optional(),
      engagement: z.number().nullable().optional(),
    })
    .optional(),
  youtube: z
    .object({
      subscribers: z.number().nullable().optional(),
      subscribersChange: z.number().nullable().optional(),
      likes: z.number().nullable().optional(),
      views: z.number().nullable().optional(),
      impressions: z.number().nullable().optional(),
      engagement: z.number().nullable().optional(),
    })
    .optional(),
  tiktok: z
    .object({
      followers: z.number().nullable().optional(),
      followersChange: z.number().nullable().optional(),
      likes: z.number().nullable().optional(),
      reach: z.number().nullable().optional(),
      impressions: z.number().nullable().optional(),
      engagement: z.number().nullable().optional(),
    })
    .optional(),
  website: z
    .object({
      sessions: z.number().nullable().optional(),
      users: z.number().nullable().optional(),
      pageviews: z.number().nullable().optional(),
      bounceRate: z.number().nullable().optional(),
      conversions: z.number().nullable().optional(),
      conversionRate: z.number().nullable().optional(),
    })
    .optional(),
  gmb: z
    .object({
      profileViews: z.number().nullable().optional(),
      searchImpressions: z.number().nullable().optional(),
      businessInteractions: z.number().nullable().optional(),
      clicks: z.number().nullable().optional(),
      calls: z.number().nullable().optional(),
      directionRequests: z.number().nullable().optional(),
    })
    .optional(),
});

export const driveConfigSchema = z.object({
  driveFileId: z.string().min(1, "Drive File ID is required"),
  driveFileName: z.string().optional(),
  sheetName: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});
