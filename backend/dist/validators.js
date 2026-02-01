"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthSettingsSchema = exports.cameraUpdateSchema = exports.cameraCreateSchema = exports.cameraTypeSchema = exports.locationUpdateSchema = exports.locationCreateSchema = void 0;
const zod_1 = require("zod");
const locationTypeSchema = zod_1.z.enum(['PLANT', 'WAREHOUSE', 'OFFICE', 'SITE']);
const slaPrioritySchema = zod_1.z.enum(['HIGH', 'MEDIUM', 'LOW']);
const emptyToUndefined = (value) => {
    if (typeof value === 'string' && value.trim() === '')
        return undefined;
    return value;
};
exports.locationCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(80),
    code: zod_1.z.string().min(2).max(20),
    region: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().min(2).max(40).optional()),
    locationType: zod_1.z.preprocess(emptyToUndefined, locationTypeSchema.optional()),
    city: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().min(2).max(80).optional()),
    state: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().min(2).max(80).optional()),
    timezone: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().min(2).max(60).optional()),
    primaryContactName: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().min(2).max(80).optional()),
    primaryContactPhone: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().min(6).max(30).optional()),
    slaPriority: zod_1.z.preprocess(emptyToUndefined, slaPrioritySchema.optional()),
    notes: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().min(1).max(600).optional()),
    latitude: zod_1.z.number().min(-90).max(90).optional(),
    longitude: zod_1.z.number().min(-180).max(180).optional(),
    active: zod_1.z.boolean().default(true),
    archivedAt: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().min(4).max(40).optional()),
    deletedAt: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().min(4).max(40).optional()),
});
exports.locationUpdateSchema = exports.locationCreateSchema.partial();
exports.cameraTypeSchema = zod_1.z.enum(['PTZ', 'FIXED', 'DOME', 'BULLET']);
exports.cameraCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(80),
    locationId: zod_1.z.string().uuid(),
    zone: zod_1.z.string().min(1).max(80),
    ipAddress: zod_1.z.string().min(3).max(80),
    rtspUrl: zod_1.z.string().min(3).max(500),
    hlsUrl: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().min(3).max(800).optional()),
    whepUrl: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().min(3).max(800).optional()),
    cameraType: exports.cameraTypeSchema,
    vendor: zod_1.z.string().min(2).max(80),
    installationDate: zod_1.z.string().min(4).max(30),
    enabled: zod_1.z.boolean().optional(),
});
exports.cameraUpdateSchema = zod_1.z.object({
    name: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().min(2).max(80).optional()),
    locationId: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().uuid().optional()),
    zone: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().min(1).max(80).optional()),
    ipAddress: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().min(3).max(80).optional()),
    rtspUrl: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().min(3).max(500).optional()),
    hlsUrl: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().min(3).max(800).optional()),
    whepUrl: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().min(3).max(800).optional()),
    cameraType: zod_1.z.preprocess(emptyToUndefined, exports.cameraTypeSchema.optional()),
    vendor: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().min(2).max(80).optional()),
    installationDate: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().min(4).max(30).optional()),
    enabled: zod_1.z.boolean().optional(),
});
exports.healthSettingsSchema = zod_1.z.object({
    pingIntervalSeconds: zod_1.z.number().int().min(2).max(60),
    timeoutMs: zod_1.z.number().int().min(200).max(10000),
    unstableThreshold: zod_1.z.number().int().min(1).max(10),
    offlineTimeoutSeconds: zod_1.z.number().int().min(5).max(3600),
    latencyWarnMs: zod_1.z.number().int().min(10).max(10000),
    autoRetryCount: zod_1.z.number().int().min(0).max(10),
    escalationMinutes: zod_1.z.number().int().min(1).max(1440),
});
