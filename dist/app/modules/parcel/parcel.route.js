"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const parcel_controller_1 = require("./parcel.controller");
const auth_1 = require("../../../middleware/auth");
const user_interface_1 = require("../user/user.interface");
const validateRequest_1 = require("../../../middleware/validateRequest");
const parcel_validate_1 = require("./parcel.validate");
const parcelRoute = (0, express_1.Router)();
// Sender creates parcel
parcelRoute.post("/", (0, auth_1.auth)([user_interface_1.Role.SENDER, user_interface_1.Role.ADMIN]), (0, validateRequest_1.validateRequest)(parcel_validate_1.parcelZodSchema.createParcelSchema), parcel_controller_1.createParcel);
// Admin updates parcel status
parcelRoute.patch("/status/:parcelId", (0, auth_1.auth)([user_interface_1.Role.ADMIN]), (0, validateRequest_1.validateRequest)(parcel_validate_1.parcelZodSchema.updateStatusSchema), parcel_controller_1.updateStatus);
// Sender or receiver gets their parcels
parcelRoute.get("/me", (0, auth_1.auth)([user_interface_1.Role.SENDER, user_interface_1.Role.RECEIVER]), parcel_controller_1.getMyParcels);
// Sender cancels their parcel (only sender allowed)
parcelRoute.patch("/cancel/:parcelId", (0, auth_1.auth)([user_interface_1.Role.SENDER]), parcel_controller_1.cancelParcel);
// Receiver confirms delivery of their parcel (only receiver allowed)
parcelRoute.patch("/confirm-delivery/:parcelId", (0, auth_1.auth)([user_interface_1.Role.RECEIVER]), parcel_controller_1.confirmDelivery);
// Admin blocks/unblocks a parcel
parcelRoute.patch("/block/:parcelId", (0, auth_1.auth)([user_interface_1.Role.ADMIN]), (0, validateRequest_1.validateRequest)(parcel_validate_1.parcelZodSchema.blockParcelSchema), // You should create this schema to validate { block: boolean, note?: string }
parcel_controller_1.blockParcel);
exports.default = parcelRoute;
