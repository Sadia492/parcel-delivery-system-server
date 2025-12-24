import { Router } from "express";
import express from "express";

import { MetaController } from "./meta.controller";
import { auth } from "../../../middleware/auth";
import { Role } from "../user/user.interface";

const metaRoute = express.Router();

// Dashboard stats for current user (based on their role)
metaRoute.get(
  "/dashboard",
  auth([Role.ADMIN, Role.SENDER, Role.RECEIVER]),
  MetaController.getDashboardStats
);

// Admin-only dashboard stats (full platform overview)
metaRoute.get(
  "/dashboard/admin",
  auth([Role.ADMIN]),
  MetaController.getAdminDashboardStats
);

// Sender-only dashboard stats
metaRoute.get(
  "/dashboard/sender",
  auth([Role.SENDER]),
  MetaController.getSenderDashboardStats
);

// Receiver-only dashboard stats
metaRoute.get(
  "/dashboard/receiver",
  auth([Role.RECEIVER]),
  MetaController.getReceiverDashboardStats
);

// Chart data for visualizations (admin only)
metaRoute.get("/charts", auth([Role.ADMIN]), MetaController.getChartData);

// Hero stats for landing page (public)
metaRoute.get("/hero-stats", MetaController.getHeroStats);

export default metaRoute;
