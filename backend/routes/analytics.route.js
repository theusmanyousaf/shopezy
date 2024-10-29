import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import { getAnalyticsData, getDailySalesData } from "../controllers/analytics.controller.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, async (req, res) => {
    try {
        const analyticsData = await getAnalyticsData();
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        const dailySalesData = getDailySalesData(startDate, endDate);
        res.status(200).json({ analyticsData, dailySalesData });
    } catch (error) {
        console.log("Error in analytics route", error.message);
        res.status(500).json({ msg: "Something went wrong", error: error.message });
    }
});

export default router;