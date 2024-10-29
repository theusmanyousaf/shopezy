import Coupon from "../models/coupon.model.js";

export const getCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findOne({ userId: req.user._id, isActive: true });
        res.json({ coupon } || null);
    } catch (error) {
        console.log("Error in getCoupon controller", error);
        res.status(500).send({ message: "server error", error: error.message });
    }
}