import { Router } from "express";
import {
  createParcel,
  updateStatus,
  getMyParcels,
  cancelParcel,
  confirmDelivery,
  blockParcel,
} from "./parcel.controller";
import { auth } from "../../../middleware/auth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../../middleware/validateRequest";
import { parcelZodSchema } from "./parcel.validate";

const parcelRoute = Router();

// Sender creates parcel
parcelRoute.post(
  "/",
  auth([Role.SENDER, Role.ADMIN]),
  validateRequest(parcelZodSchema.createParcelSchema),
  createParcel
);

// Admin updates parcel status
parcelRoute.patch(
  "/status/:parcelId",
  auth([Role.ADMIN]),
  validateRequest(parcelZodSchema.updateStatusSchema),
  updateStatus
);

// Sender or receiver gets their parcels
parcelRoute.get("/me", auth([Role.SENDER, Role.RECEIVER]), getMyParcels);

// Sender cancels their parcel (only sender allowed)
parcelRoute.patch("/cancel/:parcelId", auth([Role.SENDER]), cancelParcel);

// Receiver confirms delivery of their parcel (only receiver allowed)
parcelRoute.patch(
  "/confirm-delivery/:parcelId",
  auth([Role.RECEIVER]),
  confirmDelivery
);

// Admin blocks/unblocks a parcel
parcelRoute.patch(
  "/block/:parcelId",
  auth([Role.ADMIN]),
  validateRequest(parcelZodSchema.blockParcelSchema), // You should create this schema to validate { block: boolean, note?: string }
  blockParcel
);

export default parcelRoute;
