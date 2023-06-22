const cartRouter = require('express').Router();
const { 
    addCartItem, 
    getCartItemByCartId, 
    removeItemFromCart, 
    clearCart, 
    getCartItemInfoByUserId,
    generateCartByUser,
} = require('../models/cart');
const { getProductById } = require('../models/product');
const { checkAuthenticated, checkPayment } = require('../util/restrict');
const { 
    createOrder, generateCheckoutItemInfo, createOrderItem, 
} = require('../models/orders');


cartRouter.use(checkAuthenticated, generateCartByUser, async (req, res, next) => {
    try {
        next();
    } catch (error) {
        next(error);
    }
});

// get all carts of a user
cartRouter.get('/', async (req, res, next) => {
    try {
        const carts = await getCartItemInfoByUserId(req.user.user_id);

        if (!carts || carts===undefined || carts.length===0) {
            res.status(404);
            throw new Error('It is empty in your cart.');
        };
        
        res.status(200).send(carts);

    } catch (error) {
        next(error);
    };
});

// create cart items based on cart id (add items to a cart)
cartRouter.post('/', async (req, res, next) => {
    try {
        const cartId = req.userCart.cart_id;

        const productRes = await getProductById(req.query.productId); 
    
        if (productRes.length===0 || !productRes) {
            res.status(404);
            throw new Error('The product not existed.');
        };
    
        const result = await addCartItem(req.query.productId, cartId);
    
        if (!result || result===undefined || result.length===0) {
            res.status(500);
            throw new Error('Error on adding items to a cart.');
        };
    
        res.status(201).send('The item has been placed in cart.');
        
    } catch (error) {
        next(error);
    }
});

// empty a cart
cartRouter.delete('/', async (req, res, next) => {
    try {
        const cartId = req.userCart.cart_id;

        const cartItems = await getCartItemByCartId(cartId);

        if (cartItems.length===0 || !cartItems) {
            res.status(204);
            throw new Error('The cart is already empty.');
        }; 

        let itemIdArray = [];
        cartItems.forEach(cartItem => itemIdArray.push(cartItem.cart_item_id));

        const removedCart = clearCart(itemIdArray, req.params.cartId);

        if (removedCart.length===0 || !removedCart) {
            res.status(500);
            throw new Error('Error on emptying cart.');
        };

        res.send('Already removed all items. The cart is now empty.');

    } catch (error) {
        next(error);
    }
});

// remove items from cart
cartRouter.delete('/:cartItemId', async (req, res, next) => {
    try {
        const cartId = req.userCart.cart_id; 
        const {cartItemId} = req.params;
        
        // check if any items in the cart item table referenced to this cart id.
        const cartItems = await getCartItemByCartId(cartId);

        if (cartItems.length===0 || !cartItems) {
            res.status(404);
            throw new Error('There is no item in this cart.');
        };

        // filter to fetch the matched cart_item_id.
        const cartItem = cartItems.filter((item) => item.cart_item_id === Number(cartItemId));

        if (cartItem.length===0 || !cartItem) {
            res.status(404);
            throw new Error('No such item in the cart.');
        };

        // remove the desired item by cart item id
        const removedItem = await removeItemFromCart(cartItem[0].cart_item_id);

        if (removedItem.length===0 || !removedItem) {
            res.status(500);
            throw new Error('Error on removing the item.');
        };

        res.send('The item has been removed from the cart.');
        
    } catch (error) {
        next(error);
    }
});


cartRouter.post('/checkout', async (req, res, next) => {
    try {
        const cartId = req.userCart.cart_id; 
        const userId = req.user.user_id;
        const orderPayment = Number(req.query.orderPayment);

        // get item info from cart.
        const cartItems = await getCartItemByCartId(cartId);

        if (cartItems.length===0 || !cartItems) {
            res.status(400);
            throw new Error('There is no item in this cart.');
        };

        // save all the item id in the cart for later use.
        let cartItemIdArr = [];
        cartItems.forEach(item => cartItemIdArr.push(item.cart_item_id));
        

        // calculate price and quantity of each kind of item in cart for checkout.
        const checkoutItemInfo = await generateCheckoutItemInfo(userId);

        if (checkoutItemInfo.length===0 || !checkoutItemInfo) {
            res.status(500);
            throw new Error('Error on generating checkout info.');
        };
        
        // sum the total amount and quantity of the order.
        const totalObj = {};
        let p = 0;
        let q = 0;
        checkoutItemInfo.forEach((item) => {
            p += Number(item.total_price);
            q += Number(item.quantity);
            totalObj.totalPrice = p;
            totalObj.totalQuantity = q;
        });

        // check the payment details. simply check if amounts equal.
        const payment = await checkPayment(totalObj.totalPrice, orderPayment);

        if (!payment) {
            res.status(402);
            throw new Error('Error on payments. Please try again');
        };

        // payment comfirmed. create order.
        const orderInfo = await createOrder(totalObj.totalPrice, userId, totalObj.totalQuantity);

        if(orderInfo.length===0 || !orderInfo) {
            res.status(500);
            throw new Error('Error on creating order.');
        };

        // get orderId
        checkoutItemInfo.forEach((item) => item.orderId = orderInfo[0].order_id);

        // add order item info to order_item table.
        const orderItemInfo = await createOrderItem(checkoutItemInfo);

        if (orderItemInfo.length===0 || !orderItemInfo) {
            res.status(500);
            throw new Error('Error on creating items in orders.');
        };

        // clear cart after checkout.
        const responseClearCart = await clearCart(cartItemIdArr, cartId, true);

        if (responseClearCart.length===0 || !responseClearCart || responseClearCart===undefined) {
            res.status(500);
            throw new Error('Errors on clearing cart after order created.');
        };

        // checkout done and notify user.
        res.status(200).send(`Hi, ${req.user.first_name}. Your order has been placed. Thanks for shopping with us!`);

    } catch (error) {
        next(error);
    }
});




module.exports = cartRouter;