import { z } from 'zod'

const locationTypeSchema = z.enum(['PLANT', 'WAREHOUSE', 'OFFICE', 'SITE'])
const slaPrioritySchema = z.enum(['HIGH', 'MEDIUM', 'LOW'])

const emptyToUndefined = (value: unknown) => {
  if (typeof value === 'string' && value.trim() === '') return undefined
  return value
}

export const locationCreateSchema = z.object({
  name: z.string().min(2).max(80),
  code: z.string().min(2).max(20),
  region: z.preprocess(emptyToUndefined, z.string().min(2).max(40).optional()),
  locationType: z.preprocess(emptyToUndefined, locationTypeSchema.optional()),
  city: z.preprocess(emptyToUndefined, z.string().min(2).max(80).optional()),
  state: z.preprocess(emptyToUndefined, z.string().min(2).max(80).optional()),
  timezone: z.preprocess(emptyToUndefined, z.string().min(2).max(60).optional()),
  primaryContactName: z.preprocess(emptyToUndefined, z.string().min(2).max(80).optional()),
  primaryContactPhone: z.preprocess(emptyToUndefined, z.string().min(6).max(30).optional()),
  slaPriority: z.preprocess(emptyToUndefined, slaPrioritySchema.optional()),
  notes: z.preprocess(emptyToUndefined, z.string().min(1).max(600).optional()),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  active: z.boolean().default(true),
  archivedAt: z.preprocess(emptyToUndefined, z.string().min(4).max(40).optional()),
  deletedAt: z.preprocess(emptyToUndefined, z.string().min(4).max(40).optional()),
})

export const locationUpdateSchema = locationCreateSchema.partial()

export const cameraTypeSchema = z.enum(['PTZ', 'FIXED', 'DOME', 'BULLET'])

export const cameraCreateSchema = z.object({
  name: z.string().min(2).max(80),
  locationId: z.string().uuid(),
  zone: z.string().min(1).max(80),
  ipAddress: z.string().min(3).max(80),
  rtspUrl: z.string().min(3).max(500),
  hlsUrl: z.preprocess(emptyToUndefined, z.string().min(3).max(800).optional()),
  whepUrl: z.preprocess(emptyToUndefined, z.string().min(3).max(800).optional()),
  cameraType: cameraTypeSchema,
  vendor: z.string().min(2).max(80),
  installationDate: z.string().min(4).max(30),
  enabled: z.boolean().optional(),
})

export const cameraUpdateSchema = z.object({
  name: z.preprocess(emptyToUndefined, z.string().min(2).max(80).optional()),
  locationId: z.preprocess(emptyToUndefined, z.string().uuid().optional()),
  zone: z.preprocess(emptyToUndefined, z.string().min(1).max(80).optional()),
  ipAddress: z.preprocess(emptyToUndefined, z.string().min(3).max(80).optional()),
  rtspUrl: z.preprocess(emptyToUndefined, z.string().min(3).max(500).optional()),
  hlsUrl: z.preprocess(emptyToUndefined, z.string().min(3).max(800).optional()),
  whepUrl: z.preprocess(emptyToUndefined, z.string().min(3).max(800).optional()),
  cameraType: z.preprocess(emptyToUndefined, cameraTypeSchema.optional()),
  vendor: z.preprocess(emptyToUndefined, z.string().min(2).max(80).optional()),
  installationDate: z.preprocess(emptyToUndefined, z.string().min(4).max(30).optional()),
  enabled: z.boolean().optional(),
})

export const healthSettingsSchema = z.object({
  pingIntervalSeconds: z.number().int().min(2).max(60),
  timeoutMs: z.number().int().min(200).max(10000),
  unstableThreshold: z.number().int().min(1).max(10),

  offlineTimeoutSeconds: z.number().int().min(5).max(3600),
  latencyWarnMs: z.number().int().min(10).max(10000),
  autoRetryCount: z.number().int().min(0).max(10),
  escalationMinutes: z.number().int().min(1).max(1440),
})
