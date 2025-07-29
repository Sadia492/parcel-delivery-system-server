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
exports.blockParcel = exports.cancelParcel = exports.confirmDelivery = exports.getMyParcels = exports.updateStatus = exports.createParcel = void 0;
const parcel_service_1 = require("./parcel.service");
const sendResponse_1 = require("../../../utils/sendResponse");
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../../error/AppError"));
const catchAsync_1 = require("../../../utils/catchAsync");
// Sender creates a parcel
const createParcel = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const payload = req.body;
    const senderId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id; // From auth middleware
    const parcel = yield parcel_service_1.parcelService.createParcel(Object.assign(Object.assign({}, payload), { senderId }));
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Parcel created successfully",
        data: parcel,
    });
}));
exports.createParcel = createParcel;
// Admin updates status
const updateStatus = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { parcelId } = req.params;
    const { status, note } = req.body;
    const updatedBy = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id; // Admin ID from auth
    const parcel = yield parcel_service_1.parcelService.updateStatus(parcelId, status, updatedBy, note);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Status updated successfully",
        data: parcel,
    });
}));
exports.updateStatus = updateStatus;
// Get user's parcels
const getMyParcels = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const role = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role; // 'sender' or 'receiver'
    const parcels = yield parcel_service_1.parcelService.getUserParcels(userId, role);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Parcels retrieved successfully",
        data: parcels,
    });
}));
exports.getMyParcels = getMyParcels;
const cancelParcel = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const parcelId = req.params.parcelId;
    const senderId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    if (!senderId) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized: missing sender ID");
    }
    const parcel = yield parcel_service_1.parcelService.cancelParcel(parcelId, senderId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Parcel canceled successfully",
        data: parcel,
    });
}));
exports.cancelParcel = cancelParcel;
const confirmDelivery = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const parcelId = req.params.parcelId;
    const receiverId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    if (!receiverId) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized: missing receiver ID");
    }
    const parcel = yield parcel_service_1.parcelService.confirmDelivery(parcelId, receiverId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Parcel delivery confirmed successfully",
        data: parcel,
    });
}));
exports.confirmDelivery = confirmDelivery;
const blockParcel = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const parcelId = req.params.parcelId;
    const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const { block, note } = req.body;
    if (!adminId) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized: missing admin ID");
    }
    if (typeof block !== "boolean") {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "'block' must be a boolean");
    }
    const parcel = yield parcel_service_1.parcelService.blockParcel(parcelId, adminId, block, note);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: block
            ? "Parcel blocked successfully"
            : "Parcel unblocked successfully",
        data: parcel,
    });
}));
exports.blockParcel = blockParcel;
