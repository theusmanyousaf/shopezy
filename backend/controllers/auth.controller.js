import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

const generateTokens = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { 'expiresIn': '15m' });
    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { 'expiresIn': '7d' });
    return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
    await redis.set(`refresh_token:${userId}`, refreshToken);
}

const setCookies = (res, accessToken, refreshToken) => {
    res.cookie('accessToken', accessToken, {
        httpOnly: true, // prevent XSS attacks(cross site scripting attacks), make it unaccessable to javascript
        secure: process.env.NODE_ENV !== 'development', // only send cookie over https
        sameSite: 'strict', // prevent CSRF attacks, cross-site request forgery
        maxAge: 15 * 60 * 1000 // 15 minutes
    })
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true, // prevent XSS attacks(cross site scripting attacks), make it unaccessable to javascript
        secure: process.env.NODE_ENV !== 'development', // only send cookie over https
        sameSite: 'strict', // prevent CSRF attacks, cross-site request forgery
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
}

{/* SignUp */}

export const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ msg: "User already exists" })
        }

        const user = await User.create({ name, email, password });

        // authenticate user
        const {accessToken, refreshToken} = generateTokens(user._id)
        storeRefreshToken(user._id, refreshToken)
        setCookies(res, accessToken, refreshToken)

        res.status(201).send({ user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }, message: "User created successfully" });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
}

{/* Login */}

export const login = async (req, res) => {
    res.send("login route called")
}

{/* Logout */}

export const logout = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        if (refreshToken) {
            const docoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            await redis.del(`refresh_token:${docoded.userId}`);
        }

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.json({ message: "User logged out successfully" });
    } catch (error) {
        res.status(500).send({ message: "server error", error: error.message });
    }
}

