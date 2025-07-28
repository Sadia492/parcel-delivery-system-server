import { model, Schema } from "mongoose";
import { IsBlocked, IUser, Role } from "./user.interface";

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.USER,
    },
    isBlocked: {
      type: String,
      enum: Object.values(IsBlocked),
      default: IsBlocked.UNBLOCKED,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const User = model<IUser>("user", userSchema);
export default User;
