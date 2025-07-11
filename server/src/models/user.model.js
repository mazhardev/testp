import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    avatar: { type: String },
    password: { type: String, required: true },
    portfolioValue: { type: Number, default: 0 },
    status: { type: String, enum: ["online", "offline"], default: "offline" },
    lastActive: { type: Date, default: Date.now },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);


export default mongoose.model("User", UserSchema);
