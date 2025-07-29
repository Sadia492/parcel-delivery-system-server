"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parcel = void 0;
// src/modules/parcel/parcel.model.ts
const mongoose_1 = __importDefault(require("mongoose"));
const parcel_interface_1 = require("./parcel.interface");
const statusLogSchema = new mongoose_1.default.Schema({
    status: { type: String, enum: Object.values(parcel_interface_1.ParcelStatus), required: true },
    timestamp: { type: Date, default: Date.now },
    location: String,
    note: String,
    updatedBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
}, { _id: false });
const parcelSchema = new mongoose_1.default.Schema({
    trackingId: { type: String, required: true, unique: true },
    senderId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    receiverId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    parcelType: { type: String, enum: ["DOCUMENT", "PACKAGE"], required: true },
    weight: { type: Number, min: 0.1, required: true },
    fee: { type: Number, min: 0, default: 0 },
    status: {
        type: String,
        enum: Object.values(parcel_interface_1.ParcelStatus),
        default: parcel_interface_1.ParcelStatus.REQUESTED,
    },
    statusLogs: [statusLogSchema],
    isBlocked: { type: Boolean, default: false },
    isCanceled: { type: Boolean, default: false },
    fromAddress: { type: String, required: true }, // ✅ add this
    toAddress: { type: String, required: true }, // ✅ add this
}, {
    timestamps: true,
    versionKey: false,
});
// Indexes for optimization
parcelSchema.index({ trackingId: 1 });
parcelSchema.index({ senderId: 1, status: 1 });
parcelSchema.index({ receiverId: 1, status: 1 });
exports.Parcel = mongoose_1.default.model("parcel", parcelSchema);
