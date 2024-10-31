import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";
import Product from "../models/product.model.js";

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json({ products });
    } catch (error) {
        console.log("Error in getAllProducts controller", error);
        res.status(500).json({ message: "server error", error: error.message });
    }
}

export const getFeaturedProducts = async (req, res) => {
    try {
        // we will store the featured products in redis for faster access
        let featuredProducts = await redis.get("featured_products");
        if (featuredProducts) {
            return res.json(JSON.parse(featuredProducts));
        }

        // if there is no featured products in redis, we will fetch it from the database
        // .lean() is going to return a plain javascript object instead of a mongoose document(convert mongoose document to plain javascript object)
        featuredProducts = await Product.find({ isFeatured: true }).lean();
        if (!featuredProducts) {
            return res.status(404).json({ message: "No featured products found" });
        }

        // store the featured products in redis for faster access in future requests
        await redis.set("featured_products", JSON.stringify(featuredProducts));
        res.json(featuredProducts);

    } catch (error) {
        console.log("Error in getFeaturedProducts controller", error);
        res.status(500).json({ message: "server error", error: error.message });
    }
}

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, image, category } = req.body;

        let cloudinaryResponse;
        if (image) {
            cloudinaryResponse = await cloudinary.uploader.upload(image, { folder: 'products' });
        }

        const product = await Product.create({
            name,
            description,
            price,
            image: cloudinaryResponse?.secure_url ? cloudinaryResponse?.secure_url : "",
            category,
        });
        res.status(201).json({ product });
    } catch (error) {
        console.log("Error in createProduct controller", error);
        res.status(500).json({ message: "server error", error: error.message });
    }
}

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        if (product.image) {
            const productId = product.image.split('/').pop().split('.')[0];
            try {
                await cloudinary.uploader.destroy(`products/${productId}`);
                console.log("Product image deleted successfully from cloudinary");
            } catch (error) {
                console.log("Error in deleting product image from cloudinary", error);
            }
        }
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        console.log("Error in deleteProduct controller", error);
        res.status(500).json({ message: "server error", error: error.message });
    }
}

export const getRecommendedProducts = async (req, res) => {
    try {
        const products = await Product.aggregate([
            {
                $sample: { size: 4 },
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    image: 1,
                    price: 1,
                },
            },
        ]);

        res.json(products);
    } catch (error) {
        console.log("Error in getRecommendedProducts controller", error);
        res.status(500).json({ message: "server error", error: error.message });
    }
}

export const getProductsByCategory = async (req, res) => {
    try {
        const products = await Product.find({ category: req.params.category });
        res.json({ products });
    } catch (error) {
        console.log("Error in getProductsByCategory controller", error);
        res.status(500).json({ message: "server error", error: error.message });
    }
}

export const toggleFeaturedProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            product.isFeatured = !product.isFeatured;
            const updatedProduct = await product.save();
            await updateFeaturedProductsCache();
            res.json(updatedProduct);
        } else {
            return res.status(404).json({ message: "Product not found" });
        }

    } catch (error) {
        console.log("Error in toggleFeaturedProduct controller", error);
        res.status(500).json({ message: "server error", error: error.message });
    }
}

async function updateFeaturedProductsCache() {
    try {
        const products = await Product.find({ isFeatured: true }).lean();
        await redis.set("featured_products", JSON.stringify(products));
    } catch (error) {
        console.log("Error in updateFeaturedProductsCache controller", error);
    }
}