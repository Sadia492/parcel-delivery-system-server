"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const meta_controller_1 = require("./meta.controller");
const auth_1 = require("../../../middleware/auth");
const user_interface_1 = require("../user/user.interface");
const metaRoute = express_1.default.Router();
// Dashboard stats for current user (based on their role)
metaRoute.get("/dashboard", (0, auth_1.auth)([user_interface_1.Role.ADMIN, user_interface_1.Role.SENDER, user_interface_1.Role.RECEIVER]), meta_controller_1.MetaController.getDashboardStats);
// Admin-only dashboard stats (full platform overview)
metaRoute.get("/dashboard/admin", (0, auth_1.auth)([user_interface_1.Role.ADMIN]), meta_controller_1.MetaController.getAdminDashboardStats);
// Sender-only dashboard stats
metaRoute.get("/dashboard/sender", (0, auth_1.auth)([user_interface_1.Role.SENDER]), meta_controller_1.MetaController.getSenderDashboardStats);
// Receiver-only dashboard stats
metaRoute.get("/dashboard/receiver", (0, auth_1.auth)([user_interface_1.Role.RECEIVER]), meta_controller_1.MetaController.getReceiverDashboardStats);
// Chart data for visualizations (admin only)
metaRoute.get("/charts", (0, auth_1.auth)([user_interface_1.Role.ADMIN]), meta_controller_1.MetaController.getChartData);
// Hero stats for landing page (public)
metaRoute.get("/hero-stats", meta_controller_1.MetaController.getHeroStats);
exports.default = metaRoute;
