"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parcelZodSchema = exports.blockParcelSchema = exports.updateStatusSchema = exports.createParcelSchema = void 0;
const zod_1 = require("zod");
const parcel_interface_1 = require("./parcel.interface");
// For creating parcels
exports.createParcelSchema = zod_1.z.object({
    receiverId: zod_1.z.string().min(1, "Receiver ID is required"),
    parcelType: zod_1.z.enum(["DOCUMENT", "PACKAGE"]),
    weight: zod_1.z.number().min(0.1, "Weight must be at least 0.1kg"),
    fromAddress: zod_1.z.string().min(5, "From address too short"),
    toAddress: zod_1.z.string().min(5, "To address too short"),
});
// For updating status
exports.updateStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(Object.values(parcel_interface_1.ParcelStatus)),
    location: zod_1.z.string().optional(),
    note: zod_1.z.string().optional(),
});
exports.blockParcelSchema = zod_1.z.object({
    block: zod_1.z.boolean(),
    note: zod_1.z.string().optional(),
});
exports.parcelZodSchema = {
    createParcelSchema: exports.createParcelSchema,
    updateStatusSchema: exports.updateStatusSchema,
    blockParcelSchema: exports.blockParcelSchema,
};
