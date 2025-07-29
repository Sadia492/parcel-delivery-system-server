"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelStatus = void 0;
var ParcelStatus;
(function (ParcelStatus) {
    ParcelStatus["REQUESTED"] = "REQUESTED";
    ParcelStatus["APPROVED"] = "APPROVED";
    ParcelStatus["DISPATCHED"] = "DISPATCHED";
    ParcelStatus["IN_TRANSIT"] = "IN_TRANSIT";
    ParcelStatus["DELIVERED"] = "DELIVERED";
    ParcelStatus["CANCELED"] = "CANCELED";
    ParcelStatus["RETURNED"] = "RETURNED";
    ParcelStatus["HELD"] = "HELD";
})(ParcelStatus || (exports.ParcelStatus = ParcelStatus = {}));
