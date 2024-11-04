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
        secure: process.env.NODE_ENV === 'production', // only send cookie over https
        sameSite: 'none', // prevent CSRF attacks, cross-site request forgery
        maxAge: 15 * 60 * 1000 // 15 minutes
    })
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true, // prevent XSS attacks(cross site scripting attacks), make it unaccessable to javascript
        secure: process.env.NODE_ENV === 'production', // only send cookie over https
        sameSite: 'strict', // prevent CSRF attacks, cross-site request forgery
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
}

{/* SignUp */ }

export const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: "User already exists" })
        }

        const user = await User.create({ name, email, password });

        // authenticate user
        const { accessToken, refreshToken } = generateTokens(user._id)
        storeRefreshToken(user._id, refreshToken)
        setCookies(res, accessToken, refreshToken)

        res.status(201).send({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        console.log("Error in signup controller", error);
        res.status(500).send({ error: error.message });
    }
}

{/* Login */ }

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user && (await user.comparePassword(password))) {
            const { accessToken, refreshToken } = generateTokens(user._id)
            await storeRefreshToken(user._id, refreshToken)
            setCookies(res, accessToken, refreshToken)
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            })
        } else {
            res.status(401).send({ error: "Invalid credentials" })
        }
    } catch (error) {
        console.log("Error in login controller", error);
        res.status(500).send({ error: error.message });
    }
}

{/* Logout */ }

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
        console.log("Error in logout controller", error);
        res.status(500).send({ message: "server error", error: error.message });
    }
}

{/* Refresh Token */ }

// this will recreate the access token when it expires
export const refreshToken = async (req, res) => {
    try {
        // once accessToken expires, we need to provide refreshToken to create a new accessToken
        const { refreshToken } = req.cookies;
        if (!refreshToken) return res.status(401).json({ message: "No refreshToken provided" });

        const docoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const storedToken = await redis.get(`refresh_token:${docoded.userId}`);

        if (storedToken !== refreshToken) {
            return res.status(401).json({ message: "Refresh token is not valid" });
        }

        const accessToken = jwt.sign({ userId: docoded.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000
        })

        res.json({ message: "Token refreshed successfully" });
    }
    catch (error) {
        console.log("Error in refreshToken controller", error);
        res.status(500).send({ message: "server error", error: error.message });
    }
}

{/* Get User Profile */ }

export const getProfile = async (req, res) => {
    const user = req.user;
    try {
        res.json(user);
    } catch (error) {
        res.status(500).send({ message: "server error", error: error.message });
    }
}