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
exports.MetaService = void 0;
const mongoose_1 = require("mongoose");
const parcel_model_1 = require("../parcel/parcel.model");
const parcel_interface_1 = require("../parcel/parcel.interface");
const user_model_1 = __importDefault(require("../user/user.model"));
const user_interface_1 = require("../user/user.interface");
const fetchDashboardMetaData = (user) => __awaiter(void 0, void 0, void 0, function* () {
    let metaData;
    switch (user === null || user === void 0 ? void 0 : user.role) {
        case user_interface_1.Role.ADMIN:
            metaData = yield getAdminMetaData();
            break;
        case user_interface_1.Role.SENDER:
            metaData = yield getSenderMetaData(user);
            break;
        case user_interface_1.Role.RECEIVER:
            metaData = yield getReceiverMetaData(user);
            break;
        default:
            throw new Error("Invalid user role!");
    }
    return metaData;
});
// ADMIN Dashboard Stats
const getAdminMetaData = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    // Get all counts in parallel for better performance
    const [totalParcels, requestedParcels, approvedParcels, dispatchedParcels, deliveredParcels, canceledParcels, totalUsers, totalSenders, totalReceivers, blockedUsers, activeUsers, revenueResult, recentParcels, recentUsers,] = yield Promise.all([
        // Parcel counts
        parcel_model_1.Parcel.countDocuments(),
        parcel_model_1.Parcel.countDocuments({ status: parcel_interface_1.ParcelStatus.REQUESTED }),
        parcel_model_1.Parcel.countDocuments({ status: parcel_interface_1.ParcelStatus.APPROVED }),
        parcel_model_1.Parcel.countDocuments({ status: parcel_interface_1.ParcelStatus.DISPATCHED }),
        parcel_model_1.Parcel.countDocuments({ status: parcel_interface_1.ParcelStatus.DELIVERED }),
        parcel_model_1.Parcel.countDocuments({ status: parcel_interface_1.ParcelStatus.CANCELED }),
        // User counts
        user_model_1.default.countDocuments(),
        user_model_1.default.countDocuments({ role: user_interface_1.Role.SENDER }),
        user_model_1.default.countDocuments({ role: user_interface_1.Role.RECEIVER }),
        user_model_1.default.countDocuments({ isBlocked: user_interface_1.IsBlocked.BLOCKED }),
        user_model_1.default.countDocuments({ isBlocked: user_interface_1.IsBlocked.UNBLOCKED }),
        // Revenue calculation (from delivered parcels)
        parcel_model_1.Parcel.aggregate([
            {
                $match: {
                    status: parcel_interface_1.ParcelStatus.DELIVERED,
                },
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$fee" },
                },
            },
        ]),
        // Recent parcels (last 10)
        parcel_model_1.Parcel.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate("senderId", "name email")
            .populate("receiverId", "name email")
            .select("trackingId status parcelType weight fee createdAt")
            .lean(),
        // Recent users (last 10)
        user_model_1.default.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select("name email role isBlocked createdAt")
            .lean(),
    ]);
    // Calculate pending revenue (from non-delivered parcels)
    const pendingRevenueResult = yield parcel_model_1.Parcel.aggregate([
        {
            $match: {
                status: { $ne: parcel_interface_1.ParcelStatus.DELIVERED },
            },
        },
        {
            $group: {
                _id: null,
                pendingRevenue: { $sum: "$fee" },
            },
        },
    ]);
    const totalRevenue = ((_a = revenueResult[0]) === null || _a === void 0 ? void 0 : _a.totalRevenue) || 0;
    const pendingRevenue = ((_b = pendingRevenueResult[0]) === null || _b === void 0 ? void 0 : _b.pendingRevenue) || 0;
    return {
        totalParcels,
        totalRevenue,
        totalUsers,
        requestedParcels,
        approvedParcels,
        dispatchedParcels,
        deliveredParcels,
        canceledParcels,
        totalSenders,
        totalReceivers,
        blockedUsers,
        activeUsers,
        pendingRevenue,
        collectedRevenue: totalRevenue,
        recentParcels,
        recentUsers,
    };
});
// SENDER Dashboard Stats
const getSenderMetaData = (user) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const senderId = new mongoose_1.Types.ObjectId(user._id);
    const [senderParcels, requestedParcels, approvedParcels, dispatchedParcels, deliveredParcels, canceledParcels, revenueResult, pendingRevenueResult, recentParcels, upcomingDeliveries,] = yield Promise.all([
        // Total parcels sent
        parcel_model_1.Parcel.countDocuments({ senderId }),
        // Parcels by status
        parcel_model_1.Parcel.countDocuments({ senderId, status: parcel_interface_1.ParcelStatus.REQUESTED }),
        parcel_model_1.Parcel.countDocuments({ senderId, status: parcel_interface_1.ParcelStatus.APPROVED }),
        parcel_model_1.Parcel.countDocuments({ senderId, status: parcel_interface_1.ParcelStatus.DISPATCHED }),
        parcel_model_1.Parcel.countDocuments({ senderId, status: parcel_interface_1.ParcelStatus.DELIVERED }),
        parcel_model_1.Parcel.countDocuments({ senderId, status: parcel_interface_1.ParcelStatus.CANCELED }),
        // Collected revenue (from delivered parcels)
        parcel_model_1.Parcel.aggregate([
            {
                $match: {
                    senderId,
                    status: parcel_interface_1.ParcelStatus.DELIVERED,
                },
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$fee" },
                },
            },
        ]),
        // Pending revenue (from non-delivered parcels)
        parcel_model_1.Parcel.aggregate([
            {
                $match: {
                    senderId,
                    status: { $ne: parcel_interface_1.ParcelStatus.DELIVERED },
                },
            },
            {
                $group: {
                    _id: null,
                    pendingRevenue: { $sum: "$fee" },
                },
            },
        ]),
        // Recent parcels (last 10)
        parcel_model_1.Parcel.find({ senderId })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate("receiverId", "name email")
            .select("trackingId status parcelType weight fee toAddress createdAt")
            .lean(),
        // Upcoming deliveries (dispatched parcels)
        parcel_model_1.Parcel.find({
            senderId,
            status: { $in: [parcel_interface_1.ParcelStatus.APPROVED, parcel_interface_1.ParcelStatus.DISPATCHED] },
        })
            .sort({ createdAt: 1 })
            .limit(5)
            .populate("receiverId", "name email")
            .select("trackingId status toAddress weight fee")
            .lean(),
    ]);
    const totalRevenue = ((_a = revenueResult[0]) === null || _a === void 0 ? void 0 : _a.totalRevenue) || 0;
    const pendingRevenue = ((_b = pendingRevenueResult[0]) === null || _b === void 0 ? void 0 : _b.pendingRevenue) || 0;
    return {
        senderParcels,
        totalRevenue,
        requestedParcels,
        approvedParcels,
        dispatchedParcels,
        deliveredParcels,
        canceledParcels,
        pendingRevenue,
        collectedRevenue: totalRevenue,
        recentParcels,
        upcomingDeliveries,
    };
});
// RECEIVER Dashboard Stats
const getReceiverMetaData = (user) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const receiverId = new mongoose_1.Types.ObjectId(user._id);
    const [receiverParcels, pendingDeliveries, completedDeliveries, recentParcels, upcomingDeliveries,] = yield Promise.all([
        // Total parcels received
        parcel_model_1.Parcel.countDocuments({ receiverId }),
        // Pending deliveries (requested, approved, dispatched)
        parcel_model_1.Parcel.countDocuments({
            receiverId,
            status: {
                $in: [
                    parcel_interface_1.ParcelStatus.REQUESTED,
                    parcel_interface_1.ParcelStatus.APPROVED,
                    parcel_interface_1.ParcelStatus.DISPATCHED,
                ],
            },
        }),
        // Completed deliveries
        parcel_model_1.Parcel.countDocuments({
            receiverId,
            status: parcel_interface_1.ParcelStatus.DELIVERED,
        }),
        // Recent parcels (last 10)
        parcel_model_1.Parcel.find({ receiverId })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate("senderId", "name email")
            .select("trackingId status parcelType weight fromAddress createdAt")
            .lean(),
        // Upcoming deliveries (approved or dispatched)
        parcel_model_1.Parcel.find({
            receiverId,
            status: { $in: [parcel_interface_1.ParcelStatus.APPROVED, parcel_interface_1.ParcelStatus.DISPATCHED] },
        })
            .sort({ createdAt: 1 })
            .limit(5)
            .populate("senderId", "name email")
            .select("trackingId status fromAddress weight parcelType")
            .lean(),
    ]);
    // Calculate total amount paid
    const totalPaidResult = yield parcel_model_1.Parcel.aggregate([
        {
            $match: {
                receiverId,
                status: parcel_interface_1.ParcelStatus.DELIVERED,
            },
        },
        {
            $group: {
                _id: null,
                totalPaid: { $sum: "$fee" },
            },
        },
    ]);
    const totalPaid = ((_a = totalPaidResult[0]) === null || _a === void 0 ? void 0 : _a.totalPaid) || 0;
    return {
        receiverParcels,
        pendingDeliveries,
        completedDeliveries,
        totalRevenue: totalPaid,
        recentParcels,
        upcomingDeliveries,
    };
});
// Get hero stats for homepage/landing page
const getHeroStats = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const [totalDeliveriesResult, uniqueCustomersResult, citiesCoveredResult, successRateResult,] = yield Promise.all([
            // Total successful deliveries
            parcel_model_1.Parcel.countDocuments({ status: parcel_interface_1.ParcelStatus.DELIVERED }),
            // Unique customers (senders + receivers)
            parcel_model_1.Parcel.aggregate([
                {
                    $group: {
                        _id: null,
                        senders: { $addToSet: "$senderId" },
                        receivers: { $addToSet: "$receiverId" },
                    },
                },
                {
                    $project: {
                        totalCustomers: {
                            $size: {
                                $setUnion: ["$senders", "$receivers"],
                            },
                        },
                    },
                },
            ]),
            // Cities covered (from unique addresses)
            parcel_model_1.Parcel.distinct("toAddress").then((addresses) => {
                // Extract cities from addresses (simple logic - you might want to improve this)
                const cities = new Set();
                addresses.forEach((address) => {
                    var _a;
                    // Simple city extraction - assumes city is last part before comma
                    const parts = address.split(",");
                    if (parts.length > 1) {
                        const city = (_a = parts[parts.length - 2]) === null || _a === void 0 ? void 0 : _a.trim();
                        if (city)
                            cities.add(city);
                    }
                });
                return cities.size;
            }),
            // Delivery success rate (delivered / total)
            parcel_model_1.Parcel.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        delivered: {
                            $sum: {
                                $cond: [{ $eq: ["$status", parcel_interface_1.ParcelStatus.DELIVERED] }, 1, 0],
                            },
                        },
                    },
                },
                {
                    $project: {
                        successRate: {
                            $multiply: [{ $divide: ["$delivered", "$total"] }, 100],
                        },
                    },
                },
            ]),
        ]);
        // Format numbers with K+ notation
        const formatNumber = (num) => {
            if (num >= 1000000) {
                return `${(num / 1000000).toFixed(1)}M+`;
            }
            if (num >= 1000) {
                return `${Math.floor(num / 1000)}K+`;
            }
            return `${num}+`;
        };
        const totalDeliveries = formatNumber(totalDeliveriesResult || 0);
        const uniqueCustomers = ((_a = uniqueCustomersResult[0]) === null || _a === void 0 ? void 0 : _a.totalCustomers) || 0;
        const satisfiedCustomers = formatNumber(uniqueCustomers);
        const citiesCovered = formatNumber(citiesCoveredResult || 0);
        const successRate = Math.round(((_b = successRateResult[0]) === null || _b === void 0 ? void 0 : _b.successRate) || 98);
        return {
            totalDeliveries,
            satisfiedCustomers,
            citiesCovered,
            deliverySuccessRate: successRate,
        };
    }
    catch (error) {
        console.error("Error fetching hero stats:", error);
        // Return default/fallback values
        return {
            totalDeliveries: "50K+",
            satisfiedCustomers: "25K+",
            citiesCovered: "500+",
            deliverySuccessRate: 98,
        };
    }
});
// Get chart data for admin dashboard
const getBarChartData = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (timeframe = "monthly") {
    if (timeframe === "monthly") {
        return yield parcel_model_1.Parcel.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                    },
                    count: { $sum: 1 },
                    revenue: { $sum: "$fee" },
                },
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 },
            },
            {
                $project: {
                    month: {
                        $dateToString: {
                            format: "%Y-%m",
                            date: {
                                $dateFromParts: {
                                    year: "$_id.year",
                                    month: "$_id.month",
                                },
                            },
                        },
                    },
                    count: 1,
                    revenue: 1,
                },
            },
        ]);
    }
    else {
        // Weekly data
        return yield parcel_model_1.Parcel.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        week: { $week: "$createdAt" },
                    },
                    count: { $sum: 1 },
                    revenue: { $sum: "$fee" },
                },
            },
            {
                $sort: { "_id.year": 1, "_id.week": 1 },
            },
            {
                $project: {
                    week: {
                        $concat: [
                            { $toString: "$_id.year" },
                            "-W",
                            { $toString: "$_id.week" },
                        ],
                    },
                    count: 1,
                    revenue: 1,
                },
            },
        ]);
    }
});
// Get pie chart data for admin dashboard
const getPieChartData = () => __awaiter(void 0, void 0, void 0, function* () {
    const [statusDistribution, parcelTypeDistribution, userDistribution] = yield Promise.all([
        // Parcel status distribution
        parcel_model_1.Parcel.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    status: "$_id",
                    count: 1,
                    percentage: {
                        $multiply: [
                            {
                                $divide: [
                                    "$count",
                                    { $sum: "$count" }, // This won't work directly, we need total
                                ],
                            },
                            100,
                        ],
                    },
                },
            },
        ]).then((result) => __awaiter(void 0, void 0, void 0, function* () {
            const total = yield parcel_model_1.Parcel.countDocuments();
            return result.map((item) => (Object.assign(Object.assign({}, item), { percentage: Math.round((item.count / total) * 100) })));
        })),
        // Parcel type distribution
        parcel_model_1.Parcel.aggregate([
            {
                $group: {
                    _id: "$parcelType",
                    count: { $sum: 1 },
                },
            },
        ]),
        // User role distribution
        user_model_1.default.aggregate([
            {
                $group: {
                    _id: "$role",
                    count: { $sum: 1 },
                },
            },
        ]),
    ]);
    return {
        statusDistribution,
        parcelTypeDistribution,
        userDistribution,
    };
});
exports.MetaService = {
    fetchDashboardMetaData,
    getAdminMetaData,
    getSenderMetaData,
    getReceiverMetaData,
    getBarChartData,
    getPieChartData,
    getHeroStats,
};
