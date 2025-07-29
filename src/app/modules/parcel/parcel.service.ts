import { Parcel } from "./parcel.model";
import { ParcelStatus, IParcel, IStatusLog } from "./parcel.interface";
import { Types } from "mongoose";
import httpStatus from "http-status";
import AppError from "../../../error/AppError";

// Payload interface for parcel creation
interface ICreateParcelPayload {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  parcelType: "DOCUMENT" | "PACKAGE";
  weight: number;
  fromAddress: string;
  toAddress: string;
}

// Generate tracking ID: TRK-YYYYMMDD-XXXX
const generateTrackingId = (): string => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `TRK-${date}-${random}`;
};

// Create new parcel
const createParcel = async (
  payload: ICreateParcelPayload
): Promise<IParcel> => {
  const trackingId = generateTrackingId();
  const fee = payload.weight * 5; // Example: $5 per kg

  const statusLog: IStatusLog = {
    status: ParcelStatus.REQUESTED,
    updatedBy: payload.senderId.toString(),
    timestamp: new Date(),
  };

  const parcel = await Parcel.create({
    ...payload,
    trackingId,
    fee,
    status: ParcelStatus.REQUESTED,
    statusLogs: [statusLog],
    isBlocked: false,
    isCanceled: false,
    createdAt: new Date(),
  });
  // Populate again if necessary before return
  await parcel.populate("senderId", "name email");
  await parcel.populate("receiverId", "name email");

  const parcelObj = parcel.toObject({ depopulate: true }) as unknown as IParcel;
  return parcelObj;
};

// Update parcel status (with validation)
const updateStatus = async (
  parcelId: string,
  status: ParcelStatus,
  updatedBy: Types.ObjectId,
  note?: string
): Promise<IParcel> => {
  const parcel = await Parcel.findById(parcelId);
  if (!parcel) throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");

  // Validate status transition
  const validTransitions: Record<ParcelStatus, ParcelStatus[]> = {
    [ParcelStatus.REQUESTED]: [ParcelStatus.APPROVED, ParcelStatus.CANCELED],
    [ParcelStatus.APPROVED]: [ParcelStatus.DISPATCHED, ParcelStatus.HELD],
    [ParcelStatus.DISPATCHED]: [ParcelStatus.DELIVERED, ParcelStatus.HELD],
    [ParcelStatus.HELD]: [ParcelStatus.DISPATCHED],
    [ParcelStatus.DELIVERED]: [],
    [ParcelStatus.CANCELED]: [],
    [ParcelStatus.IN_TRANSIT]: [ParcelStatus.DELIVERED, ParcelStatus.HELD],
    [ParcelStatus.RETURNED]: [],
  };

  if (!validTransitions[parcel.status]?.includes(status)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid status transition");
  }

  const statusLog: IStatusLog = {
    status,
    updatedBy: updatedBy.toString(),
    timestamp: new Date(),
    ...(note && { note }),
  };

  parcel.status = status;
  parcel.statusLogs.push(statusLog);

  if (status === ParcelStatus.CANCELED) {
    parcel.isCanceled = true;
  }
  await parcel.save();
  // Populate again if necessary before return
  await parcel.populate("senderId", "name email");
  await parcel.populate("receiverId", "name email");

  const parcelObj = parcel.toObject({ depopulate: true }) as unknown as IParcel;
  return parcelObj;
};

// Get parcels for a user (sender/receiver)
const getSenderParcels = async (
  senderId: Types.ObjectId
): Promise<IParcel[]> => {
  const parcels = await Parcel.find({ senderId })
    .sort({ createdAt: -1 })
    .populate("senderId", "name email")
    .populate("receiverId", "name email")
    .lean();

  return parcels as IParcel[];
};

// Cancel parcel (sender only, if not dispatched)
const cancelParcel = async (
  parcelId: string,
  senderId: Types.ObjectId
): Promise<IParcel> => {
  const parcel = await Parcel.findById(parcelId);
  if (!parcel) throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");

  // Check ownership
  if (parcel.senderId.toString() !== senderId.toString()) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Not authorized to cancel this parcel"
    );
  }

  // Allow cancel only if status is REQUESTED or APPROVED
  if (
    ![ParcelStatus.REQUESTED, ParcelStatus.APPROVED].includes(parcel.status)
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot cancel parcel after dispatch"
    );
  }

  parcel.status = ParcelStatus.CANCELED;
  parcel.isCanceled = true;
  parcel.statusLogs.push({
    status: ParcelStatus.CANCELED,
    updatedBy: senderId.toString(),
    timestamp: new Date(),
    note: "Parcel canceled by sender",
  });

  await parcel.save();
  await parcel.populate("senderId", "name email");
  await parcel.populate("receiverId", "name email");

  const parcelObj = parcel.toObject({ depopulate: true }) as unknown as IParcel;
  return parcelObj;
};

// Confirm delivery (receiver only)
const confirmDelivery = async (
  parcelId: string,
  receiverId: Types.ObjectId
): Promise<IParcel> => {
  const parcel = await Parcel.findById(parcelId);
  if (!parcel) throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");

  // Check ownership
  if (parcel.receiverId.toString() !== receiverId.toString()) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Not authorized to confirm delivery"
    );
  }

  // Only allow confirmation if status is DISPATCHED or IN_TRANSIT
  if (
    ![ParcelStatus.DISPATCHED, ParcelStatus.IN_TRANSIT].includes(parcel.status)
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Parcel not in deliverable state"
    );
  }

  parcel.status = ParcelStatus.DELIVERED;
  parcel.statusLogs.push({
    status: ParcelStatus.DELIVERED,
    updatedBy: receiverId.toString(),
    timestamp: new Date(),
    note: "Parcel delivery confirmed by receiver",
  });

  await parcel.save();
  await parcel.populate("senderId", "name email");
  await parcel.populate("receiverId", "name email");

  const parcelObj = parcel.toObject({ depopulate: true }) as unknown as IParcel;
  return parcelObj;
};

// Block/unblock parcel (admin only)
const blockParcel = async (
  parcelId: string,
  adminId: Types.ObjectId,
  block: boolean,
  note?: string
): Promise<IParcel> => {
  const parcel = await Parcel.findById(parcelId);
  if (!parcel) throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");

  parcel.isBlocked = block;

  parcel.statusLogs.push({
    status: block ? ParcelStatus.HELD : parcel.status, // or a special BLOCKED status if defined
    updatedBy: adminId.toString(),
    timestamp: new Date(),
    note: block
      ? `Parcel blocked by admin. ${note ?? ""}`
      : `Parcel unblocked by admin.`,
  });

  await parcel.save();
  await parcel.populate("senderId", "name email");
  await parcel.populate("receiverId", "name email");

  const parcelObj = parcel.toObject({ depopulate: true }) as unknown as IParcel;
  return parcelObj;
};

// Get incoming (active) parcels for receiver
const getIncomingParcels = async (
  receiverId: Types.ObjectId
): Promise<IParcel[]> => {
  const parcels = await Parcel.find({
    receiverId,
    status: { $nin: [ParcelStatus.DELIVERED, ParcelStatus.CANCELED] },
  })
    .sort({ createdAt: -1 })
    .populate("senderId", "name email")
    .populate("receiverId", "name email")
    .lean();

  return parcels as IParcel[];
};

// Get delivery history for receiver
const getDeliveryHistory = async (
  receiverId: Types.ObjectId
): Promise<IParcel[]> => {
  const parcels = await Parcel.find({
    receiverId,
    status: ParcelStatus.DELIVERED,
  })
    .sort({ createdAt: -1 })
    .populate("senderId", "name email")
    .populate("receiverId", "name email")
    .lean();

  return parcels as IParcel[];
};

const getAllParcels = async () => {
  const parcels = await Parcel.find({})
    .sort({ createdAt: -1 })
    .populate("senderId", "name email")
    .populate("receiverId", "name email")
    .lean();

  return parcels;
};

export const parcelService = {
  createParcel,
  updateStatus,
  getSenderParcels,
  cancelParcel,
  confirmDelivery,
  blockParcel,
  getDeliveryHistory,
  getIncomingParcels,
  getAllParcels,
};
