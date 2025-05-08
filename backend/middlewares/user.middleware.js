import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export async function checkIsUserValid(req, res, next) {
    try {
      const token = req.cookies.token;
      const data = await jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(data?.userId);
      if (!user) {
        return res.json({ success: false, error: "User not valid." });
      }
      req.userId = data.userId;
      next();
    } catch (error) {
      console.log(error, "error here");
      return res.json({ success: false, error:"Not Valid" });
    }
  }