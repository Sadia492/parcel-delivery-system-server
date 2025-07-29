"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsBlocked = exports.Role = void 0;
var Role;
(function (Role) {
    Role["ADMIN"] = "ADMIN";
    Role["SENDER"] = "SENDER";
    Role["RECEIVER"] = "RECEIVER";
})(Role || (exports.Role = Role = {}));
var IsBlocked;
(function (IsBlocked) {
    IsBlocked["UNBLOCKED"] = "UNBLOCKED";
    IsBlocked["BLOCKED"] = "BLOCKED";
})(IsBlocked || (exports.IsBlocked = IsBlocked = {}));
