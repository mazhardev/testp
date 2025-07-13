import { userProgress } from "../../data/user.data.js";
import User from "../models/user.model.js";
import Balance from "../models/balance.model.js";
import XP from "../models/xp.model.js";
import Referral from "../models/referral.model.js";
import jwt from "jsonwebtoken";

const getUserProgress = async (req, res) => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    res.status(200).json({ data: userProgress });
  } catch (error) {
    console.error("Error fetching user progress:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const signUp = async (req, res) => {
  const { name, email, password } = req.body;
  // Validate input data
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "User with this email already exists",
    });
  }

  const role = email.includes("@madquick") ? "admin" : "user";
  const user = await User.create({
    name,
    email,
    password: password,
    role: role,
    //avatar: avatar,
  });
  if (!user) {
    return res.status(500).json({ message: "Error creating user" });
  }
  // Create a balance entry for the user
  const balance = await Balance.create({
    user: user._id,
    amount: Math.floor(Math.random() * (1000000 - 100000 + 1)) + 100000,
  });
  const xp = await XP.create({
    user: user._id,
    xp: 0,
  });
  const referral = await Referral.findOne({
    referredUsers: { $in: [email] },
  });
  if (referral) {
    // console.log("Referral found:", referral);
    await Balance.findOneAndUpdate(
      { user: referral.user },
      { $inc: { amount: 500 } },
      { new: true }
    );
    await Balance.findOneAndUpdate(
      { user: user._id },
      { $inc: { amount: 500 } },
      { new: true }
    );
  }
  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: user,
  });
};

const logIn = async (req, res) => {
  const { email, password } = req.body;
  // Validate input data
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  // check for password match
  const user = await User.findOne({ email, password });
  if (!user) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

      // Increment login count and set lastLogin
    user.loginCount += 1;
    user.lastLogin = new Date();
    user.status = "online";
    await user.save();


  const token = jwt.sign(
    { userId: user._id, email, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
  const data = {
    name: user.name,
    email: user.email,
    token,
  };
  res.status(200).json({
    success: true,
    message: "User logged in successfully",
    data,
  });
};

const logout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate session duration
    if (user.lastLogin) {
      const sessionDuration = (new Date() - user.lastLogin) / 1000; // Duration in seconds
      user.sessionDurations.push(sessionDuration);
    }

    // Update status to offline
    user.status = "offline";
    await user.save();

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { signUp, logIn, getUserProgress, logout };