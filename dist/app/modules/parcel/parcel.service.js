"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parcelService = void 0;
const parcel_model_1 = require("./parcel.model");
const parcel_interface_1 = require("./parcel.interface");
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../../error/AppError"));
// Generate tracking ID: TRK-YYYYMMDD-XXXX
const generateTrackingId = () => {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const random = Math.floor(1000 + Math.random() * 9000);
    return `TRK-${date}-${random}`;
};
// Create new parcel
const createParcel = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const trackingId = generateTrackingId();
    const fee = payload.weight * 5; // Example: $5 per kg
    const statusLog = {
        status: parcel_interface_1.ParcelStatus.REQUESTED,
        updatedBy: payload.senderId.toString(),
        timestamp: new Date(),
    };
    const parcel = yield parcel_model_1.Parcel.create(Object.assign(Object.assign({}, payload), { trackingId,
        fee, status: parcel_interface_1.ParcelStatus.REQUESTED, statusLogs: [statusLog], isBlocked: false, isCanceled: false, createdAt: new Date() }));
    // Populate again if necessary before return
    yield parcel.populate("senderId", "name email");
    yield parcel.populate("receiverId", "name email");
    const parcelObj = parcel.toObject({ depopulate: true });
    return parcelObj;
});
// Update parcel status (with validation)
const updateStatus = (parcelId, status, updatedBy, note) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const parcel = yield parcel_model_1.Parcel.findById(parcelId);
    if (!parcel)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Parcel not found");
    // Validate status transition
    const validTransitions = {
        [parcel_interface_1.ParcelStatus.REQUESTED]: [parcel_interface_1.ParcelStatus.APPROVED, parcel_interface_1.ParcelStatus.CANCELED],
        [parcel_interface_1.ParcelStatus.APPROVED]: [parcel_interface_1.ParcelStatus.DISPATCHED, parcel_interface_1.ParcelStatus.HELD],
        [parcel_interface_1.ParcelStatus.DISPATCHED]: [parcel_interface_1.ParcelStatus.DELIVERED, parcel_interface_1.ParcelStatus.HELD],
        [parcel_interface_1.ParcelStatus.HELD]: [parcel_interface_1.ParcelStatus.DISPATCHED],
        [parcel_interface_1.ParcelStatus.DELIVERED]: [],
        [parcel_interface_1.ParcelStatus.CANCELED]: [],
        [parcel_interface_1.ParcelStatus.IN_TRANSIT]: [parcel_interface_1.ParcelStatus.DELIVERED, parcel_interface_1.ParcelStatus.HELD],
        [parcel_interface_1.ParcelStatus.RETURNED]: [],
    };
    if (!((_a = validTransitions[parcel.status]) === null || _a === void 0 ? void 0 : _a.includes(status))) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Invalid status transition");
    }
    const statusLog = Object.assign({ status, updatedBy: updatedBy.toString(), timestamp: new Date() }, (note && { note }));
    parcel.status = status;
    parcel.statusLogs.push(statusLog);
    if (status === parcel_interface_1.ParcelStatus.CANCELED) {
        parcel.isCanceled = true;
    }
    yield parcel.save();
    // Populate again if necessary before return
    yield parcel.populate("senderId", "name email");
    yield parcel.populate("receiverId", "name email");
    const parcelObj = parcel.toObject({ depopulate: true });
    return parcelObj;
});
// Get parcels for a user (sender/receiver)
const getUserParcels = (userId, role) => __awaiter(void 0, void 0, void 0, function* () {
    const query = role === "sender" ? { senderId: userId } : { receiverId: userId };
    const parcels = yield parcel_model_1.Parcel.find(query)
        .sort({ createdAt: -1 })
        .populate("senderId", "name email") // populate senderId with name and email only
        .populate("receiverId", "name email") // populate receiverId similarly
        .lean();
    return parcels;
});
// Cancel parcel (sender only, if not dispatched)
const cancelParcel = (parcelId, senderId) => __awaiter(void 0, void 0, void 0, function* () {
    const parcel = yield parcel_model_1.Parcel.findById(parcelId);
    if (!parcel)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Parcel not found");
    // Check ownership
    if (parcel.senderId.toString() !== senderId.toString()) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "Not authorized to cancel this parcel");
    }
    // Allow cancel only if status is REQUESTED or APPROVED
    if (![parcel_interface_1.ParcelStatus.REQUESTED, parcel_interface_1.ParcelStatus.APPROVED].includes(parcel.status)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Cannot cancel parcel after dispatch");
    }
    parcel.status = parcel_interface_1.ParcelStatus.CANCELED;
    parcel.isCanceled = true;
    parcel.statusLogs.push({
        status: parcel_interface_1.ParcelStatus.CANCELED,
        updatedBy: senderId.toString(),
        timestamp: new Date(),
        note: "Parcel canceled by sender",
    });
    yield parcel.save();
    yield parcel.populate("senderId", "name email");
    yield parcel.populate("receiverId", "name email");
    const parcelObj = parcel.toObject({ depopulate: true });
    return parcelObj;
});
// Confirm delivery (receiver only)
const confirmDelivery = (parcelId, receiverId) => __awaiter(void 0, void 0, void 0, function* () {
    const parcel = yield parcel_model_1.Parcel.findById(parcelId);
    if (!parcel)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Parcel not found");
    // Check ownership
    if (parcel.receiverId.toString() !== receiverId.toString()) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "Not authorized to confirm delivery");
    }
    // Only allow confirmation if status is DISPATCHED or IN_TRANSIT
    if (![parcel_interface_1.ParcelStatus.DISPATCHED, parcel_interface_1.ParcelStatus.IN_TRANSIT].includes(parcel.status)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Parcel not in deliverable state");
    }
    parcel.status = parcel_interface_1.ParcelStatus.DELIVERED;
    parcel.statusLogs.push({
        status: parcel_interface_1.ParcelStatus.DELIVERED,
        updatedBy: receiverId.toString(),
        timestamp: new Date(),
        note: "Parcel delivery confirmed by receiver",
    });
    yield parcel.save();
    yield parcel.populate("senderId", "name email");
    yield parcel.populate("receiverId", "name email");
    const parcelObj = parcel.toObject({ depopulate: true });
    return parcelObj;
});
// Block/unblock parcel (admin only)
const blockParcel = (parcelId, adminId, block, note) => __awaiter(void 0, void 0, void 0, function* () {
    const parcel = yield parcel_model_1.Parcel.findById(parcelId);
    if (!parcel)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Parcel not found");
    parcel.isBlocked = block;
    parcel.statusLogs.push({
        status: block ? parcel_interface_1.ParcelStatus.HELD : parcel.status, // or a special BLOCKED status if defined
        updatedBy: adminId.toString(),
        timestamp: new Date(),
        note: block
            ? `Parcel blocked by admin. ${note !== null && note !== void 0 ? note : ""}`
            : `Parcel unblocked by admin.`,
    });
    yield parcel.save();
    yield parcel.populate("senderId", "name email");
    yield parcel.populate("receiverId", "name email");
    const parcelObj = parcel.toObject({ depopulate: true });
    return parcelObj;
});
exports.parcelService = {
    createParcel,
    updateStatus,
    getUserParcels,
    cancelParcel,
    confirmDelivery,
    blockParcel,
};
