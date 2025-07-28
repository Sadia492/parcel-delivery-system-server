import { Types } from "mongoose";

export enum ParcelStatus {
  REQUESTED = "REQUESTED",
  APPROVED = "APPROVED",
  DISPATCHED = "DISPATCHED",
  IN_TRANSIT = "IN_TRANSIT",
  DELIVERED = "DELIVERED",
  CANCELED = "CANCELED",
  RETURNED = "RETURNED",
  HELD = "HELD",
}

export interface IStatusLog {
  status: ParcelStatus;
  location?: string;
  note?: string;
  updatedBy: "Admin" | "System"; // admin or system
}

export interface IParcel {
  trackingId: string;
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  weight: number;
  address: string;
  fee: number;
  status: ParcelStatus;
  statusLogs: IStatusLog[];
  isBlocked?: boolean;
  isCanceled?: boolean;
}
