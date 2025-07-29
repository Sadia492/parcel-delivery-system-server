import { z } from "zod";
import { ParcelStatus } from "./parcel.interface";

// For creating parcels
export const createParcelSchema = z.object({
  receiverId: z.string().min(1, "Receiver ID is required"),
  parcelType: z.enum(["DOCUMENT", "PACKAGE"]),
  weight: z.number().min(0.1, "Weight must be at least 0.1kg"),
  fromAddress: z.string().min(5, "From address too short"),
  toAddress: z.string().min(5, "To address too short"),
});

// For updating status
export const updateStatusSchema = z.object({
  status: z.enum(Object.values(ParcelStatus) as [string, ...string[]]),
  location: z.string().optional(),
  note: z.string().optional(),
});
export const blockParcelSchema = z.object({
  block: z.boolean(),
  note: z.string().optional(),
});

export const parcelZodSchema = {
  createParcelSchema,
  updateStatusSchema,
  blockParcelSchema,
};
