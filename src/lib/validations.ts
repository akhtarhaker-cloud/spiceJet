import { z } from "zod";

export const enquirySchema = z.object({
  enquiryType: z.enum(["contact", "export"]),
  name: z.string().trim().min(2).max(120),
  companyName: z.string().trim().max(160).optional().or(z.literal("")),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(6).max(40),
  country: z.string().trim().min(2).max(120),
  productName: z.string().trim().min(2).max(160),
  requiredQuantity: z.string().trim().min(1).max(100),
  packagingRequirement: z.string().trim().max(500).optional().or(z.literal("")),
  message: z.string().trim().max(150).optional().or(z.literal("")),
});

export const productSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().trim().min(2).max(160),
  localName: z.string().trim().min(1).max(160),
  description: z.string().trim().min(10).max(1000),
  imageUrl: z.string().trim().min(1).max(1000),
  rate: z.coerce.number().nonnegative().nullable().optional(),
  unit: z.string().trim().max(60).nullable().optional(),
  isActive: z.boolean(),
  position: z.coerce.number().int().nonnegative(),
});

export const settingsSchema = z.object({
  brandName: z.string().trim().min(2).max(120), tagline: z.string().trim().max(160), ownerName: z.string().trim().max(120), businessType: z.string().trim().max(120),
  heroEyebrow: z.string().trim().max(160), heroHeading: z.string().trim().max(160), heroHighlight: z.string().trim().max(160), heroLead: z.string().trim().max(200), heroSubline: z.string().trim().max(240),
  aboutIntro: z.string().trim().max(1200), aboutDetail: z.string().trim().max(1200), mission: z.string().trim().max(800), vision: z.string().trim().max(800),
  email: z.string().trim().email(), phonePrimary: z.string().trim().min(6).max(40), phoneSecondary: z.string().trim().max(40), whatsappNumber: z.string().trim().regex(/^\d{8,15}$/), location: z.string().trim().max(240), pin: z.string().trim().max(20), mapsUrl: z.string().trim().url().or(z.literal("")),
  gstNumber: z.string().trim().max(100), udyamNumber: z.string().trim().max(100), iecNumber: z.string().trim().max(100), logoUrl: z.string().trim().min(1), heroImageUrl: z.string().trim().min(1),
  facebookUrl: z.string().trim().url().or(z.literal("")), instagramUrl: z.string().trim().url().or(z.literal("")), linkedinUrl: z.string().trim().url().or(z.literal("")), youtubeUrl: z.string().trim().url().or(z.literal("")),
});
