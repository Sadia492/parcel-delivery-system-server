"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_route_1 = __importDefault(require("../app/modules/user/user.route"));
const auth_route_1 = __importDefault(require("../app/modules/auth/auth.route"));
const parcel_route_1 = __importDefault(require("../app/modules/parcel/parcel.route"));
const meta_route_1 = __importDefault(require("../app/modules/meta/meta.route"));
const routes = (0, express_1.Router)();
routes.use("/user", user_route_1.default);
routes.use("/auth", auth_route_1.default);
routes.use("/parcel", parcel_route_1.default);
routes.use("/meta", meta_route_1.default);
exports.default = routes;
