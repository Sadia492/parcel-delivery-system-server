import mongoose from "mongoose";

const statusLogSchema = new mongoose.Schema({
  status: String, // e.g., Requested, Dispatched
  timestamp: { type: Date, default: Date.now },
  location: String,
  note: String,
  updatedBy: { type: String }, // "system" or userId
});

const parcelSchema = new mongoose.Schema({
  trackingId: String,
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  fromAddress: String,
  toAddress: String,
  weight: Number,
  fee: Number,
  status: { type: String, default: "Requested" },
  statusLogs: [statusLogSchema],
  isBlocked: { type: Boolean, default: false },
  isCanceled: { type: Boolean, default: false },
});

module.exports = mongoose.model("Parcel", parcelSchema);
