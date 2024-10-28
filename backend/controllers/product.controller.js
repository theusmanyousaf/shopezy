import Product from "../models/product.model.js";

export const getAllProducts = async (req,res) => {
    try {
        const products = await Product.find({});
        res.json({products});
    } catch (error) {
        console.log("Error in getAllProducts controller", error);
        res.status(500).json({message: "server error", error: error.message});
    }
}
