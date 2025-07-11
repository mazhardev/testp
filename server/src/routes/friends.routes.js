import { Router } from "express";
import { getFriends, inviteFriend, sendChallengeInvitation, respondToChallenge, getChallengeInvitations, addFriend} from "../controller/friends.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import User from "../models/user.model.js";

const friendsRouter = Router();


friendsRouter.get("/", auth, getFriends);
friendsRouter.post("/invite", auth, inviteFriend);
friendsRouter.post("/challenge", auth, sendChallengeInvitation);
friendsRouter.post("/challenge/respond", auth, respondToChallenge);
friendsRouter.get("/challenge/invitations", auth, getChallengeInvitations);
friendsRouter.post("/add-friend", addFriend);


export { friendsRouter };
