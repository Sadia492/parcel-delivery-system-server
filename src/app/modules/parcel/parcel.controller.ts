import { Request, Response } from "express";
import { parcelService } from "./parcel.service";
import { sendResponse } from "../../../utils/sendResponse";
import httpStatus from "http-status";
import AppError from "../../../error/AppError";
import { catchAsync } from "../../../utils/catchAsync";

// Sender creates a parcel
const createParcel = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const senderId = req.user?._id; // From auth middleware

  const parcel = await parcelService.createParcel({
    ...payload,
    senderId,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Parcel created successfully",
    data: parcel,
  });
});

// Admin updates status
const updateStatus = catchAsync(async (req: Request, res: Response) => {
  const { parcelId } = req.params;
  const { status, note } = req.body;
  const updatedBy = req.user?._id; // Admin ID from auth

  const parcel = await parcelService.updateStatus(
    parcelId,
    status,
    updatedBy,
    note
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Status updated successfully",
    data: parcel,
  });
});

// Get user's parcels
const getMyParcels = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const role = req.user?.role; // 'sender' or 'receiver'

  const parcels = await parcelService.getUserParcels(userId, role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Parcels retrieved successfully",
    data: parcels,
  });
});
const cancelParcel = catchAsync(async (req: Request, res: Response) => {
  const parcelId = req.params.parcelId;
  const senderId = req.user?._id;

  if (!senderId) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Unauthorized: missing sender ID"
    );
  }

  const parcel = await parcelService.cancelParcel(parcelId, senderId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Parcel canceled successfully",
    data: parcel,
  });
});

const confirmDelivery = catchAsync(async (req: Request, res: Response) => {
  const parcelId = req.params.parcelId;
  const receiverId = req.user?._id;

  if (!receiverId) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Unauthorized: missing receiver ID"
    );
  }

  const parcel = await parcelService.confirmDelivery(parcelId, receiverId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Parcel delivery confirmed successfully",
    data: parcel,
  });
});

const blockParcel = catchAsync(async (req: Request, res: Response) => {
  const parcelId = req.params.parcelId;
  const adminId = req.user?._id;
  const { block, note } = req.body;

  if (!adminId) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Unauthorized: missing admin ID"
    );
  }

  if (typeof block !== "boolean") {
    throw new AppError(httpStatus.BAD_REQUEST, "'block' must be a boolean");
  }

  const parcel = await parcelService.blockParcel(
    parcelId,
    adminId,
    block,
    note
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: block
      ? "Parcel blocked successfully"
      : "Parcel unblocked successfully",
    data: parcel,
  });
});

export {
  createParcel,
  updateStatus,
  getMyParcels,
  confirmDelivery,
  cancelParcel,
  blockParcel,
};
