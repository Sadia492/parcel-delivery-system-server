"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const user_interface_1 = require("./user.interface");
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: Object.values(user_interface_1.Role),
        default: user_interface_1.Role.RECEIVER,
    },
    isBlocked: {
        type: String,
        enum: Object.values(user_interface_1.IsBlocked),
        default: user_interface_1.IsBlocked.UNBLOCKED,
    },
}, {
    timestamps: true,
    versionKey: false,
});
const User = (0, mongoose_1.model)("user", userSchema);
exports.default = User;
