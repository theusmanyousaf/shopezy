import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
    try {
        const { accessToken } = req.cookies;
        if (!accessToken) {
            return res.status(401).json({ msg: "Not authorized - No access token" });
        }
        try {
            const docoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findById({ _id: docoded.userId }).select("-password");
            if (!user) {
                return res.status(401).json({ msg: "User not found" });
            }
            req.user = user;

            next();
        } catch (error) {
            if(error.name === 'TokenExpiredError'){
                return res.status(401).json({ msg: "Unauthorized - Access token expired" });
            }
            throw error;
        }

    } catch (error) {
        console.log("Error in protectRoute middleware", error);
        return res.status(401).json({ msg: "Not authorized, Invalid access token" });
    }
}


export const adminRoute = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        return res.status(403).json({ msg: "Access denied - Admin only" });
    }
}