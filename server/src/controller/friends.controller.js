import { friends } from "../../data/friends.data.js";
import { dailyChallenges } from "../../data/challenges.data.js";
import Referral from "../models/referral.model.js";
import ChallengeInvitation from "../models/challengeInvitation.model.js";
import User from "../models/user.model.js";
import Portfolio from "../models/portfolio.model.js";
import ETF from "../models/etf.model.js";


const getTimeAgo = (lastActive) => {
  if (!lastActive || isNaN(new Date(lastActive).getTime())) {
    return "Recently active";
  }
  const now = new Date();
  const lastActiveDate = new Date(lastActive);
  const diffInMs = now - lastActiveDate;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths === 1 ? "" : "s"} ago`;
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears === 1 ? "" : "s"} ago`;
};


const getFriends = async (req, res) => {
  try {
    const users = await User.find({}, "name avatar _id lastActive");
    const etfs = await ETF.find({});
    const etfMap = etfs.reduce((map, etf) => {
      map[etf._id.toString()] = etf.price;
      return map;
    }, {});
    const formatted = await Promise.all(
      users.map(async (u) => {
        const portfolio = await Portfolio.findOne({ user: u._id });
        let portfolioValue = 0;
        if (portfolio && portfolio.stocks) {
          portfolioValue = portfolio.stocks.reduce((sum, stock) => {
            const currentPrice = etfMap[stock.etf.toString()] || 0;
            return sum + stock.quantity * currentPrice;
          }, 0);
        }
        const isCurrentUser = u._id.toString() === req.user._id;
        const status = isCurrentUser ? "online" : getTimeAgo(u.lastActive);

        return {
          id: u._id.toString(),
          name: u.name,
          avatar: u.avatar,
          portfolioValue,
          status,
          lastActive: u.lastActive, 
        };
      })
    );

    res.status(200).json({ data: formatted });
  } catch (error) {
    console.error("Error fetching friends:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const inviteFriend = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const referral = await Referral.findOne({ user: req.user.id });
    if (referral) {
      if (referral.referredUsers.includes(email)) {
        return res.status(400).json({ message: "User already referred" });
      }
      referral.referredUsers.push(email);
      await referral.save();
    } else {
      await Referral.create({
        user: req.user.id,
        referredUsers: [email],
      });
    }
    res.status(200).json({ message: "Invitation sent successfully" });
  } catch (error) {
    console.error("Error inviting friend:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const sendChallengeInvitation = async (req, res) => {
  try {
    const { recipientId, challengeId } = req.body;
    const senderId = req.user.id;
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }
    const challenge = dailyChallenges.find((c) => c.id === challengeId);
    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }
    const invitation = await ChallengeInvitation.create({
      sender: senderId,
      recipient: recipientId,
      challengeId,
    });
    console.log("Created invitation with ID:", invitation._id);
    res.status(201).json({ message: "Challenge invitation sent", data: invitation });
  } catch (error) {
    console.error("Error sending challenge invitation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



const respondToChallenge = async (req, res) => {
  try {
    const { invitationId, status } = req.body;
    console.log("Received invitationId:", invitationId); 
    const userId = req.user.id;
    const invitation = await ChallengeInvitation.findById(invitationId);
    if (!invitation) {
      console.log("Invitation not found for id:", invitationId); 
      return res.status(404).json({ message: "Invitation not found" });
    }
      if (invitation.recipient.toString() !== userId) {
          return res.status(403).json({ message: "Not authorized to respond to this invitation" });
      }
      if (invitation.status !== "pending") {
          return res.status(400).json({ message: "Invitation already responded to" });
      }
      invitation.status = status;
      await invitation.save();

      res.status(200).json({ message: `Challenge ${status}`, data: invitation });
  } catch (error) {
      console.error("Error responding to challenge:", error);
      res.status(500).json({ message: "Internal server error" });
  }
};

const getChallengeInvitations = async (req, res) => {
  try {
    const invitations = await ChallengeInvitation.find({
      recipient: req.user.id,
      status: "pending",
    })
      .populate("sender", "name")
      .populate("challengeId", "title"); // Note: This won't work with static challenges; adjust as needed
    res.status(200).json({ data: invitations });
  } catch (error) {
    console.error("Error fetching invitations:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const addFriend = async (req, res) => {
    try {
        const {
            name,
            email,
            avatar,
            password,
            portfolioValue,
            status,
            lastActive,
        } = req.body;
    
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required" });
        }
    
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: "User with this email already exists" });
        }
    
        const user = await User.create({
            name,
            email,
            avatar,
            password,
            portfolioValue,
            status,
            lastActive: lastActive ? new Date(lastActive) : new Date(),
        });
    
        res.status(201).json({ message: "Friend added", data: user });
        } catch (error) {
        console.error("Error adding friend:", error);
        res.status(500).json({ message: "Internal server error" });
        }
};

export { getFriends, inviteFriend, sendChallengeInvitation, respondToChallenge, getChallengeInvitations, addFriend };
