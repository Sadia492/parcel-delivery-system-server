import { Types } from "mongoose";

export enum ParcelStatus {
  REQUESTED = "REQUESTED",
  APPROVED = "APPROVED",
  DISPATCHED = "DISPATCHED",
  IN_TRANSIT = "IN_TRANSIT",
  DELIVERED = "DELIVERED",
  CANCELED = "CANCELED",
  BLOCKED = "BLOCKED",
  UNBLOCKED = "UNBLOCKED",
  // RETURNED = "RETURNED",
  // HELD = "HELD",
}

export interface IStatusLog {
  status: ParcelStatus;
  timestamp: Date; // when this status update was made
  location?: string;
  note?: string;
  updatedBy: string; // can be admin, system, or user ID
}

export interface IParcel {
  trackingId: string; // TRK-YYYYMMDD-XXXX
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  fromAddress: string;
  toAddress: string;
  parcelType: string;
  weight: number; // in kg
  fee: number; // calculated
  deliveryDate?: Date; // optional: ETA or actual
  status: ParcelStatus;
  statusLogs: IStatusLog[];
  note?: string; // optional sender note
  isBlocked?: boolean;
  isCanceled?: boolean;
}
