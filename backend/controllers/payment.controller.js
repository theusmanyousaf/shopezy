import Coupon from '../models/coupon.model.js';
import Order from "../models/order.model.js";
import { stripe } from '../lib/stripe.js';

export const createCheckoutSession = async (req, res) => {
    try {
        const { products, couponCode } = req.body;
        if (!Array.isArray(products) || !products.length) {
            return res.status(400).json({ error: "Invalid products list" });
        }

        let totalAmount = 0;

        const lineItems = products.map((product) => {
            const amount = Math.round(product.price * 100); // Stripe accepts the total amount in cents, not dollars.
            totalAmount += amount * product.quantity;

            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: product.name,
                        image: product.image,
                    },
                    unit_amount: amount,
                }
            };
        });

        let coupon = null;
        if (couponCode) {
            coupon = await Coupon.findOne({ code: couponCode, isActive: true });
            if (coupon) {
                totalAmount -= Math.round(totalAmount * (coupon.discountPercentage / 100));
            }
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
            discounts: coupon
                ? [
                    {
                        coupon: await createStripeCoupon(coupon.discountPercentage),
                    },
                ]
                : [],
            metadata: {
                userId: req.user._id.toString(),
                couponCode: coupon?.code || "",
                products: JSON.stringify(
                    products.map(p => ({
                        id: p._id,
                        quantity: p.quantity,
                        price: p.price
                    }))
                ),
            }
        });

        if (totalAmount >= 20000) {
            await createNewCoupon(req.user._id);
        }

        res.json({ id: session.id, totalAmount: totalAmount / 100 });
    } catch (error) {
        console.log("Error in createCheckoutSession controller", error);
        res.status(500).json({ message: "server error", error: error.message });
    }
}

export const checkoutSuccess = async (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            if (session.metadata.couponCode) {
                await Coupon.findOneAndUpdate({
                    code: session.metadata.couponCode,
                    userId: session.metadata.userId
                }, {
                    isActive: false
                })
            }

            // CREATE A NEW ORDER
            const products = JSON.parse(session.metadata.products);
            const newOrder = new Order({
                user: session.metadata.userId,
                products: products.map(product => ({
                    productId: product.id,
                    quantity: product.quantity,
                    price: product.price
                })),
                totalAmount: session.amount_total / 100, // convert cents to dollars
                stripeSessionId: sessionId
            })

            await newOrder.save();
            res.status(200).json({
                success: true,
                message: "Payment successful, order created, and coupon deactivated if used.",
                orderId: newOrder._id
            })
        }
    } catch (error) {
        console.log("Error processing successful checkout", error);
        res.status(500).json({ message: "Error processing successful checkout", error: error.message });
    }
}

async function createStripeCoupon(discountPercentage) {
    const stripeCoupon = await stripe.coupons.create({
        percent_off: discountPercentage,
        duration: "once",
    });
    return stripeCoupon.id;
}

async function createNewCoupon(userId) {
    const newCoupon = new Coupon({
        conde: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        discountPercentage: 10,
        expirationDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now,
        userId: userId,
    });
    await newCoupon.save();
    return newCoupon;
}