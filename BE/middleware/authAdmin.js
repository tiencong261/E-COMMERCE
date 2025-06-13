import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const authAdmin = async (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication token is required" });
    }

    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    if (!token_decode || !token_decode.id) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const user = await User.findById(token_decode.id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ success: false, message: "Token has expired" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    console.error("Admin auth middleware error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export default authAdmin;
