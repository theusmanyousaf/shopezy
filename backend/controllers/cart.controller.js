
export const addToCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = req.user;

        const existingItem = user.cartItems.find(item => item.id === productId);
        if(existingItem) {
            existingItem.quantity += 1;
        } else {
            user.cartItems.push(productId);
        }
        await user.save();
        res.json(user.cartItems);

    } catch (error) {
        console.log("Error in addToCart controller", error);
        res.status(500).json({ message: "server error", error: error.message });
    }
}

export const removeAllProducts = async (req, res) => {
    try {
        const {productId} = req.body;
        const user = req.user;
        if(!productId){
            user.cartItems = [];
        } else {
            user.cartItems = user.cartItems.filter((item) => item.id !== productId);
        }
        await user.save();
        res.json(user.cartItems);
    } catch (error) {
        console.log("Error in removeAllProducts controller", error);
        res.status(500).json({ message: "server error", error: error.message });
    }
}

export const getCartProducts = async (req, res) => {
    
}

export const updateProductQuantity = async (req, res) => {

}