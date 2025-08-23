import { Router } from "express";
import {
  createParcel,
  updateStatus,
  cancelParcel,
  confirmDelivery,
  blockParcel,
  getSenderParcels,
  getAllParcels,
  getDeliveryHistory,
  getIncomingParcels,
} from "./parcel.controller";
import { auth } from "../../../middleware/auth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../../middleware/validateRequest";
import { parcelZodSchema } from "./parcel.validate";
import { checkUserBlocked } from "../../../middleware/checkUserBlocked";

const parcelRoute = Router();

parcelRoute.get("/", auth([Role.ADMIN]), getAllParcels);
parcelRoute.get("/track", getAllParcels);
parcelRoute.get(
  "/incoming",
  auth([Role.RECEIVER]),
  checkUserBlocked,
  getIncomingParcels
);
parcelRoute.get(
  "/history",
  auth([Role.RECEIVER]),
  checkUserBlocked,
  getDeliveryHistory
);

// Sender creates parcel
parcelRoute.post(
  "/",
  auth([Role.SENDER]),
  checkUserBlocked,
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
parcelRoute.get(
  "/me",
  auth([Role.SENDER, Role.RECEIVER]),
  checkUserBlocked,
  getSenderParcels
);

// Sender cancels their parcel (only sender allowed)
parcelRoute.patch(
  "/cancel/:parcelId",
  auth([Role.SENDER]),
  checkUserBlocked,
  cancelParcel
);

// Receiver confirms delivery of their parcel (only receiver allowed)
parcelRoute.patch(
  "/confirm-delivery/:parcelId",
  auth([Role.RECEIVER]),
  checkUserBlocked,
  confirmDelivery
);

// Admin blocks/unblocks a parcel
parcelRoute.patch(
  "/block/:parcelId",
  auth([Role.ADMIN]),
  checkUserBlocked,
  validateRequest(parcelZodSchema.blockParcelSchema), // You should create this schema to validate { block: boolean, note?: string }
  blockParcel
);

export default parcelRoute;
