import { Types } from "mongoose";
import { Parcel } from "../parcel/parcel.model";
import { ParcelStatus } from "../parcel/parcel.interface";
import User from "../user/user.model";
import { IsBlocked, IUser, Role } from "../user/user.interface";

export interface DashboardStats {
  // Common stats
  totalParcels?: number;
  totalRevenue?: number;
  totalUsers?: number;

  // Parcel status stats
  requestedParcels?: number;
  approvedParcels?: number;
  dispatchedParcels?: number;
  deliveredParcels?: number;
  canceledParcels?: number;

  // User stats
  totalSenders?: number;
  totalReceivers?: number;
  blockedUsers?: number;
  activeUsers?: number;

  // Role-specific stats
  senderParcels?: number;
  receiverParcels?: number;
  pendingDeliveries?: number;
  completedDeliveries?: number;

  // Financial stats
  pendingRevenue?: number;
  collectedRevenue?: number;

  // Recent data
  recentParcels?: any[];
  recentUsers?: any[];
  upcomingDeliveries?: any[];
}

export interface ChartData {
  monthlyShipments: Array<{
    month: string;
    count: number;
    revenue: number;
  }>;
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  userDistribution: Array<{
    role: string;
    count: number;
    percentage: number;
  }>;
}

export interface HeroStats {
  totalDeliveries: string;
  satisfiedCustomers: string;
  citiesCovered: string;
  deliverySuccessRate: number;
}

const fetchDashboardMetaData = async (user: IUser): Promise<DashboardStats> => {
  let metaData: DashboardStats;

  switch (user?.role) {
    case Role.ADMIN:
      metaData = await getAdminMetaData();
      break;
    case Role.SENDER:
      metaData = await getSenderMetaData(user);
      break;
    case Role.RECEIVER:
      metaData = await getReceiverMetaData(user);
      break;
    default:
      throw new Error("Invalid user role!");
  }

  return metaData;
};

// ADMIN Dashboard Stats
const getAdminMetaData = async (): Promise<DashboardStats> => {
  // Get all counts in parallel for better performance
  const [
    totalParcels,
    requestedParcels,
    approvedParcels,
    dispatchedParcels,
    deliveredParcels,
    canceledParcels,
    totalUsers,
    totalSenders,
    totalReceivers,
    blockedUsers,
    activeUsers,
    revenueResult,
    recentParcels,
    recentUsers,
  ] = await Promise.all([
    // Parcel counts
    Parcel.countDocuments(),
    Parcel.countDocuments({ status: ParcelStatus.REQUESTED }),
    Parcel.countDocuments({ status: ParcelStatus.APPROVED }),
    Parcel.countDocuments({ status: ParcelStatus.DISPATCHED }),
    Parcel.countDocuments({ status: ParcelStatus.DELIVERED }),
    Parcel.countDocuments({ status: ParcelStatus.CANCELED }),

    // User counts
    User.countDocuments(),
    User.countDocuments({ role: Role.SENDER }),
    User.countDocuments({ role: Role.RECEIVER }),
    User.countDocuments({ isBlocked: IsBlocked.BLOCKED }),
    User.countDocuments({ isBlocked: IsBlocked.UNBLOCKED }),

    // Revenue calculation (from delivered parcels)
    Parcel.aggregate([
      {
        $match: {
          status: ParcelStatus.DELIVERED,
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
    Parcel.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("senderId", "name email")
      .populate("receiverId", "name email")
      .select("trackingId status parcelType weight fee createdAt")
      .lean(),

    // Recent users (last 10)
    User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("name email role isBlocked createdAt")
      .lean(),
  ]);

  // Calculate pending revenue (from non-delivered parcels)
  const pendingRevenueResult = await Parcel.aggregate([
    {
      $match: {
        status: { $ne: ParcelStatus.DELIVERED },
      },
    },
    {
      $group: {
        _id: null,
        pendingRevenue: { $sum: "$fee" },
      },
    },
  ]);

  const totalRevenue = revenueResult[0]?.totalRevenue || 0;
  const pendingRevenue = pendingRevenueResult[0]?.pendingRevenue || 0;

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

    recentParcels,
    recentUsers,
  };
};

// SENDER Dashboard Stats
const getSenderMetaData = async (user: IUser): Promise<DashboardStats> => {
  const senderId = new Types.ObjectId((user as any)._id as string);

  const [
    senderParcels,
    requestedParcels,
    approvedParcels,
    dispatchedParcels,
    deliveredParcels,
    canceledParcels,
    revenueResult,
    pendingRevenueResult,
    recentParcels,
    upcomingDeliveries,
  ] = await Promise.all([
    // Total parcels sent
    Parcel.countDocuments({ senderId }),

    // Parcels by status
    Parcel.countDocuments({ senderId, status: ParcelStatus.REQUESTED }),
    Parcel.countDocuments({ senderId, status: ParcelStatus.APPROVED }),
    Parcel.countDocuments({ senderId, status: ParcelStatus.DISPATCHED }),
    Parcel.countDocuments({ senderId, status: ParcelStatus.DELIVERED }),
    Parcel.countDocuments({ senderId, status: ParcelStatus.CANCELED }),

    // Collected revenue (from delivered parcels)
    Parcel.aggregate([
      {
        $match: {
          senderId,
          status: ParcelStatus.DELIVERED,
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
    Parcel.aggregate([
      {
        $match: {
          senderId,
          status: { $ne: ParcelStatus.DELIVERED },
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
    Parcel.find({ senderId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("receiverId", "name email")
      .select("trackingId status parcelType weight fee toAddress createdAt")
      .lean(),

    // Upcoming deliveries (dispatched parcels)
    Parcel.find({
      senderId,
      status: { $in: [ParcelStatus.APPROVED, ParcelStatus.DISPATCHED] },
    })
      .sort({ createdAt: 1 })
      .limit(5)
      .populate("receiverId", "name email")
      .select("trackingId status toAddress weight fee")
      .lean(),
  ]);

  const totalRevenue = revenueResult[0]?.totalRevenue || 0;
  const pendingRevenue = pendingRevenueResult[0]?.pendingRevenue || 0;

  return {
    senderParcels,
    totalRevenue,

    requestedParcels,
    approvedParcels,
    dispatchedParcels,
    deliveredParcels,
    canceledParcels,

    recentParcels,
    upcomingDeliveries,
  };
};

// RECEIVER Dashboard Stats
const getReceiverMetaData = async (user: IUser): Promise<DashboardStats> => {
  const receiverId = new Types.ObjectId((user as any)._id as string);

  const [
    receiverParcels,
    pendingDeliveries,
    completedDeliveries,
    recentParcels,
    upcomingDeliveries,
  ] = await Promise.all([
    // Total parcels received
    Parcel.countDocuments({ receiverId }),

    // Pending deliveries (requested, approved, dispatched)
    Parcel.countDocuments({
      receiverId,
      status: {
        $in: [
          ParcelStatus.REQUESTED,
          ParcelStatus.APPROVED,
          ParcelStatus.DISPATCHED,
        ],
      },
    }),

    // Completed deliveries
    Parcel.countDocuments({
      receiverId,
      status: ParcelStatus.DELIVERED,
    }),

    // Recent parcels (last 10)
    Parcel.find({ receiverId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("senderId", "name email")
      .select("trackingId status parcelType weight fromAddress createdAt")
      .lean(),

    // Upcoming deliveries (approved or dispatched)
    Parcel.find({
      receiverId,
      status: { $in: [ParcelStatus.APPROVED, ParcelStatus.DISPATCHED] },
    })
      .sort({ createdAt: 1 })
      .limit(5)
      .populate("senderId", "name email")
      .select("trackingId status fromAddress weight parcelType")
      .lean(),
  ]);

  // Calculate total amount paid
  const totalPaidResult = await Parcel.aggregate([
    {
      $match: {
        receiverId,
        status: ParcelStatus.DELIVERED,
      },
    },
    {
      $group: {
        _id: null,
        totalPaid: { $sum: "$fee" },
      },
    },
  ]);

  const totalPaid = totalPaidResult[0]?.totalPaid || 0;

  return {
    receiverParcels,
    pendingDeliveries,
    completedDeliveries,
    recentParcels,
    upcomingDeliveries,
  };
};

// Get hero stats for homepage/landing page
const getHeroStats = async (): Promise<HeroStats> => {
  try {
    const [
      totalDeliveriesResult,
      uniqueCustomersResult,
      citiesCoveredResult,
      successRateResult,
    ] = await Promise.all([
      // Total successful deliveries
      Parcel.countDocuments({ status: ParcelStatus.DELIVERED }),

      // Unique customers (senders + receivers)
      Parcel.aggregate([
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
      Parcel.distinct("toAddress").then((addresses) => {
        // Extract cities from addresses (simple logic - you might want to improve this)
        const cities = new Set();
        addresses.forEach((address: string) => {
          // Simple city extraction - assumes city is last part before comma
          const parts = address.split(",");
          if (parts.length > 1) {
            const city = parts[parts.length - 2]?.trim();
            if (city) cities.add(city);
          }
        });
        return cities.size;
      }),

      // Delivery success rate (delivered / total)
      Parcel.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            delivered: {
              $sum: {
                $cond: [{ $eq: ["$status", ParcelStatus.DELIVERED] }, 1, 0],
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
    const formatNumber = (num: number): string => {
      if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M+`;
      }
      if (num >= 1000) {
        return `${Math.floor(num / 1000)}K+`;
      }
      return `${num}+`;
    };

    const totalDeliveries = formatNumber(totalDeliveriesResult || 0);
    const uniqueCustomers = uniqueCustomersResult[0]?.totalCustomers || 0;
    const satisfiedCustomers = formatNumber(uniqueCustomers);
    const citiesCovered = formatNumber(citiesCoveredResult || 0);
    const successRate = Math.round(successRateResult[0]?.successRate || 98);

    return {
      totalDeliveries,
      satisfiedCustomers,
      citiesCovered,
      deliverySuccessRate: successRate,
    };
  } catch (error) {
    console.error("Error fetching hero stats:", error);
    // Return default/fallback values
    return {
      totalDeliveries: "50K+",
      satisfiedCustomers: "25K+",
      citiesCovered: "500+",
      deliverySuccessRate: 98,
    };
  }
};

// Get chart data for admin dashboard
const getBarChartData = async (timeframe: "monthly" | "weekly" = "monthly") => {
  if (timeframe === "monthly") {
    return await Parcel.aggregate([
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
  } else {
    // Weekly data
    return await Parcel.aggregate([
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
};

// Get pie chart data for admin dashboard
const getPieChartData = async () => {
  const [statusDistribution, parcelTypeDistribution, userDistribution] =
    await Promise.all([
      // Parcel status distribution
      Parcel.aggregate([
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
      ]).then(async (result) => {
        const total = await Parcel.countDocuments();
        return result.map((item) => ({
          ...item,
          percentage: Math.round((item.count / total) * 100),
        }));
      }),

      // Parcel type distribution
      Parcel.aggregate([
        {
          $group: {
            _id: "$parcelType",
            count: { $sum: 1 },
          },
        },
      ]),

      // User role distribution
      User.aggregate([
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
};

export const MetaService = {
  fetchDashboardMetaData,
  getAdminMetaData,
  getSenderMetaData,
  getReceiverMetaData,
  getBarChartData,
  getPieChartData,
  getHeroStats,
};
