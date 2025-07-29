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
exports.unblockUser = exports.blockUser = exports.getSingleUser = exports.refreshToken = exports.getUsers = exports.loginUser = exports.registerUser = void 0;
const user_model_1 = __importDefault(require("./user.model"));
const user_service_1 = require("./user.service");
const http_status_1 = __importDefault(require("http-status"));
const env_1 = require("../../config/env");
const sendResponse_1 = require("../../../utils/sendResponse");
const catchAsync_1 = require("../../../utils/catchAsync");
const registerUser = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = req.body;
    const data = yield user_service_1.userService.registerUser(payload);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User Registered Successfully",
        data,
    });
}));
exports.registerUser = registerUser;
const getSingleUser = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_service_1.userService.getSingleUser(req.params.id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User fetched successfully",
        data: result,
    });
}));
exports.getSingleUser = getSingleUser;
const blockUser = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_service_1.userService.blockUser(req.params.id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User blocked successfully",
        data: result,
    });
}));
exports.blockUser = blockUser;
const unblockUser = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_service_1.userService.unblockUser(req.params.id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User unblocked successfully",
        data: result,
    });
}));
exports.unblockUser = unblockUser;
const loginUser = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = req.body;
    const data = yield user_service_1.userService.loginUser(payload);
    res.cookie("accessToken", data.accessToken, {
        secure: env_1.envVars.NODE_ENV !== "development",
        httpOnly: true,
        sameSite: "none",
    });
    res.cookie("refreshToken", data.refreshToken, {
        secure: env_1.envVars.NODE_ENV !== "development",
        httpOnly: true,
        sameSite: "none",
    });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User Login Successfully",
        data,
    });
}));
exports.loginUser = loginUser;
const refreshToken = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.cookies.refreshToken;
    const data = yield user_service_1.userService.refreshToken(refreshToken);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User Registered Successfully",
        data,
    });
}));
exports.refreshToken = refreshToken;
const getUsers = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield user_model_1.default.find();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User retrieved Successfully",
        data,
    });
}));
exports.getUsers = getUsers;
