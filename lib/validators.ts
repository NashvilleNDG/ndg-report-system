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
      views:               z.number().nullable().optional(),
      contentInteractions: z.number().nullable().optional(),
      follows:             z.number().nullable().optional(),
      numberOfPosts:       z.number().nullable().optional(),
    })
    .optional(),
  facebook: z
    .object({
      views:               z.number().nullable().optional(),
      contentInteractions: z.number().nullable().optional(),
      follows:             z.number().nullable().optional(),
      numberOfPosts:       z.number().nullable().optional(),
    })
    .optional(),
  youtube: z
    .object({
      views:          z.number().nullable().optional(),
      subscribers:    z.number().nullable().optional(),
      numberOfVideos: z.number().nullable().optional(),
    })
    .optional(),
  tiktok: z
    .object({
      views:               z.number().nullable().optional(),
      contentInteractions: z.number().nullable().optional(),
      follows:             z.number().nullable().optional(),
      numberOfReels:       z.number().nullable().optional(),
    })
    .optional(),
  website: z
    .object({
      totalUsers: z.number().nullable().optional(),
      newUsers:   z.number().nullable().optional(),
      views:      z.number().nullable().optional(),
      eventCount: z.number().nullable().optional(),
    })
    .optional(),
  gmb: z
    .object({
      profileInteractions: z.number().nullable().optional(),
      views:               z.number().nullable().optional(),
      searches:            z.number().nullable().optional(),
      numberOfReviews:     z.number().nullable().optional(),
    })
    .optional(),
  email: z
    .object({
      numberOfEmails: z.number().nullable().optional(),
      totalSends:     z.number().nullable().optional(),
      openRate:       z.number().nullable().optional(),
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
