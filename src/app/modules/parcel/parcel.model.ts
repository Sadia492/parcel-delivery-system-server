// src/modules/parcel/parcel.model.ts
import mongoose from "mongoose";
import { ParcelStatus } from "./parcel.interface";

const statusLogSchema = new mongoose.Schema(
  {
    status: { type: String, enum: Object.values(ParcelStatus), required: true },
    timestamp: { type: Date, default: Date.now },
    location: String,
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { _id: false }
);

const parcelSchema = new mongoose.Schema(
  {
    trackingId: { type: String, required: true, unique: true },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    parcelType: { type: String, enum: ["DOCUMENT", "PACKAGE"], required: true },
    weight: { type: Number, min: 0.1, required: true },
    fee: { type: Number, min: 0, default: 0 },
    status: {
      type: String,
      enum: Object.values(ParcelStatus),
      default: ParcelStatus.REQUESTED,
    },
    statusLogs: [statusLogSchema],
    isBlocked: { type: Boolean, default: false },
    isCanceled: { type: Boolean, default: false },
    fromAddress: { type: String, required: true }, // ✅ add this
    toAddress: { type: String, required: true }, // ✅ add this
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for optimization
parcelSchema.index({ trackingId: 1 });
parcelSchema.index({ senderId: 1, status: 1 });
parcelSchema.index({ receiverId: 1, status: 1 });

export const Parcel = mongoose.model("parcel", parcelSchema);
