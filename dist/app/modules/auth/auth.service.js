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
exports.authService = void 0;
const AppError_1 = __importDefault(require("../../../error/AppError"));
const env_1 = require("../../config/env");
const user_model_1 = __importDefault(require("../user/user.model"));
const bcrypt = __importStar(require("bcrypt"));
const changePassword = (email, newPassword, oldPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExist = yield user_model_1.default.findOne({ email });
    if (!isUserExist)
        throw new AppError_1.default(404, "User Not Found");
    const storedPassword = yield isUserExist.password;
    const isMatchedPassword = yield bcrypt.compare(oldPassword, storedPassword);
    if (!isMatchedPassword)
        throw new AppError_1.default(403, "Password Not Matched");
    isUserExist.password = yield bcrypt.hash(newPassword, env_1.envVars.PASSWORD_SALT_ROUND);
    yield isUserExist.save();
    return isUserExist;
});
const resetPassword = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExist = yield user_model_1.default.findOne({ email });
    if (!isUserExist)
        throw new AppError_1.default(404, "User Not Found");
    isUserExist.password = yield bcrypt.hash(password, env_1.envVars.PASSWORD_SALT_ROUND);
    yield isUserExist.save();
    return {
        email: isUserExist.email,
    };
});
exports.authService = {
    changePassword,
    resetPassword,
};
