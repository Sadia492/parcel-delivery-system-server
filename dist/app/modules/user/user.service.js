"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.userService = void 0;
const user_model_1 = __importDefault(require("./user.model"));
const bcrypt = __importStar(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_1 = __importDefault(require("../../../error/AppError"));
const env_1 = require("../../config/env");
const registerUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    payload.password = yield bcrypt.hash(payload.password, 10);
    const user = new user_model_1.default(payload);
    const data = yield user.save();
    return data;
});
const loginUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExist = yield user_model_1.default.findOne({ email: payload.email });
    if (!isUserExist)
        throw new AppError_1.default(404, "User Not Found");
    const checkPassword = yield bcrypt.compare(payload.password, isUserExist.password);
    if (!checkPassword)
        throw new AppError_1.default(403, "Password not matched");
    const jwtPayload = {
        _id: isUserExist._id.toString(), // ✅ add user id
        email: payload.email,
        role: isUserExist.role,
    };
    const accessToken = jsonwebtoken_1.default.sign(jwtPayload, env_1.envVars.JWT_ACCESS_SECRET, { expiresIn: env_1.envVars.JWT_ACCESS_EXPIRES });
    const refreshToken = jsonwebtoken_1.default.sign(jwtPayload, env_1.envVars.JWT_REFRESH_SECRET, { expiresIn: env_1.envVars.JWT_ACCESS_EXPIRES });
    return {
        accessToken,
        refreshToken,
    };
});
const refreshToken = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    const verifyRefreshToken = jsonwebtoken_1.default.verify(refreshToken, env_1.envVars.JWT_REFRESH_SECRET);
    const isUserExist = yield user_model_1.default.findOne({ email: verifyRefreshToken.email });
    if (!isUserExist)
        throw new AppError_1.default(404, "User Not Found");
    const jwtPayload = {
        email: isUserExist.email,
        role: isUserExist.role,
    };
    const accessToken = jsonwebtoken_1.default.sign(jwtPayload, env_1.envVars.JWT_ACCESS_SECRET, { expiresIn: env_1.envVars.JWT_ACCESS_EXPIRES });
    return { accessToken };
});
const getSingleUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield user_model_1.default.findById(id);
});
const blockUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield user_model_1.default.findByIdAndUpdate(id, { isBlocked: "BLOCKED" }, { new: true });
});
const unblockUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield user_model_1.default.findByIdAndUpdate(id, { isBlocked: "UNBLOCKED" }, { new: true });
});
const getMe = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.default.findById(userId).select("-password");
    return {
        data: user,
    };
});
const getAllReceivers = () => __awaiter(void 0, void 0, void 0, function* () {
    // Fetch users where role is RECEIVER
    return yield user_model_1.default.find({
        role: "RECEIVER",
        isBlocked: { $ne: "BLOCKED" },
    }).select("_id name email");
});
exports.userService = {
    registerUser,
    loginUser,
    refreshToken,
    getSingleUser,
    blockUser,
    unblockUser,
    getMe,
    getAllReceivers,
};
