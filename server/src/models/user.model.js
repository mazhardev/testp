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
    loginCount: { type: Number, default: 0 }, // Tracks total number of logins
    sessionDurations: [{ type: Number }], // Array of session durations in seconds
    lastLogin: { type: Date }, // Tracks the start of the current session
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);