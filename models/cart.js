const db = require('../db/index');

const generateCartByUser = async (req, res, next) => {
    try {
        const userCart = await getCartByUserId(req.user.user_id);

        if (userCart.length===0 || !userCart) {
            
            const newCart = await createCart(req.user.user_id);

            if (!newCart || newCart===undefined || newCart.length===0) {
                throw new Error('Error on creating a new cart.');
            };

            req.userCart = newCart[0];

            next();
        };

        req.userCart = userCart[0];

        next();

    } catch (error) {
        next(error);
    }
};

const createCart = async (user_id) => {
    try {
        const text = 'INSERT INTO cart_info(created, user_id) VALUES($1, $2) RETURNING *';
        const values = ['NOW()', user_id];

        const result =  await db.executeQuery(text, values);

        return result;
        
    } catch (error) {
        throw(error);
    }
};

const getCartItemInfoByUserId = async (user_id) => {
    try {
        const textHead = 'WITH cart AS (SELECT info.cart_id as cart_id, item.cart_item_id as cart_item_id, item.product_id as product_id FROM cart_info as info, cart_item as item WHERE info.cart_id = item.cart_id AND info.user_id = $1) ';
        const textTail = 'SELECT cart.cart_id, cart.cart_item_id as cart_item_id, product."name" as product_name, product.price as price, product.description as description FROM cart LEFT JOIN product ON cart.product_id = product.product_id ORDER BY 1;';
        const text = textHead + textTail;
        const values = [user_id];

        const result =  await db.executeQuery(text, values);

        return result;
        
    } catch (error) {
        throw(error);
    }
};

const getCartByUserId = async (user_id) => {
    try {
        const text = 'SELECT * FROM cart_info WHERE user_id = $1';
        const values = [user_id];

        const result = await db.executeQuery(text, values);

        return result;

    } catch (error) {
        throw(error);
    }
};


const getCartById = async (cartId) => {
    try {
        const text = 'SELECT * FROM cart_info WHERE cart_id = $1';
        const values = [cartId];

        const result = await db.executeQuery(text, values);

        return result;

    } catch (error) {
        throw(error);
    }
};

const addCartItem = async (productId, cartId) => {
    try {
        const text = 'INSERT INTO cart_item(created, product_id, cart_id) VALUES($1, $2, $3) RETURNING *';
        const values = ['NOW()', productId, cartId];

        const result = await db.executeQuery(text, values);

        return result;

    } catch (error) {
        throw error;
    }
};

const getCartItemByCartId = async (cartId) => {
    try {
        const text = 'SELECT * FROM cart_item WHERE cart_id = $1';
        const values = [cartId];

        const result = await db.executeQuery(text, values);

        return result;

    } catch (error) {
        throw(error);
    }
};

const getItemsByCartItemId = async (cartItemId) => {
    try {
        const text = 'SELECT * FROM cart_item WHERE cart_item_id = $1';
        const values = [cartItemId];

        const result = await db.executeQuery(text, values);

        return result;

    } catch (error) {
        throw(error);
    }
};

const removeItemFromCart = async (cartItemId) => {
    try {
        const text = 'DELETE FROM cart_item WHERE cart_item_id=$1 RETURNING *';
        const values = [cartItemId];

        const response = await db.executeQuery(text, values);

        return response;

    } catch (error) {
        throw(error);
    }
};

const clearCart = async (itemIdArray, cartId, checkout=false) => {
    try {
        let deletedRecords = 0;
        for (let i=0; i<itemIdArray.length; i++) {
            const response = await removeItemFromCart(itemIdArray[i]);
            response.length===0 ? deletedRecords+=0 : deletedRecords+=1;
        };

        if (deletedRecords!==itemIdArray.length) return '';

        // check if still any items in the cart.
        const cartStatus = await getCartItemByCartId(cartId);

        // if checkout is true and still items remain in the cart
        // then return the remainning.
        if (checkout===true && cartStatus.length!==0) return cartStatus;
        
        // neither, delete the cart id from cart info table.
        const text = 'DELETE FROM cart_info WHERE cart_id=$1 RETURNING *';
        const values = [cartId];

        const result = await db.executeQuery(text, values);

        return result;
                
    } catch (error) {
        throw(error);
    }
};


module.exports = {
    createCart, getCartById, addCartItem, getCartItemByCartId,
    removeItemFromCart, getItemsByCartItemId, clearCart,
    getCartItemInfoByUserId, getCartByUserId, generateCartByUser, 
};
