const db = require('../db/index');


const getOrders = async (userId, orderId) => {
    try {
        const textHead = 'WITH orders AS(SELECT oi.order_id as order_id, oi.status as status, oi.created as created, oit.quantity as quantity, oit.price as price, oit.product_id as product_id FROM order_info as oi, order_item as oit WHERE oi.order_id = oit.order_id AND oi.user_id = $1 ';
        const textTail = ') SELECT o.order_id as order_id, o.status as status, o.created as created, p."name" as product_name, o.quantity as quantity, o.quantity * o.price as price,  p.description as description FROM orders AS o LEFT JOIN product AS p ON o.product_id = p.product_id ORDER BY 1, 3;';

        if (orderId!==undefined || orderId) {
            const condition = 'AND oi.order_id = $2';
            const ordersText = textHead + condition + textTail;
            const ordersValues = [userId, orderId];

            const ordersRecords = await db.executeQuery(ordersText, ordersValues);

            return ordersRecords;
        };

        const allOrdersText = textHead + textTail;
        const allOrdersValues = [userId];

        const AllOrdersRecords = await db.executeQuery(allOrdersText, allOrdersValues);
        
        return AllOrdersRecords;
    
    } catch (error) {
        throw (error);
    }
};

const generateCheckoutItemInfo = async (userId) => {
    try {
        const textHead = 'SELECT co.cart_id as cart_id, co.product_id as product_id, co.product_name as product_name, co.description as description, SUM(co.price) as total_price, COUNT(co.product_id) as quantity FROM ';
        const textBody = '(WITH cart AS (SELECT info.cart_id as cart_id, item.cart_item_id as cart_item_id, item.product_id as product_id FROM cart_info as info, cart_item as item WHERE info.cart_id = item.cart_id AND info.user_id = $1) ';
        const textTail = 'SELECT cart.cart_id, product.product_id as product_id, product."name" as product_name, product.description as description, product.price as price FROM cart LEFT JOIN product ON cart.product_id = product.product_id) AS co GROUP BY 1,2,3,4 ORDER BY 1,2;';
        const text = textHead + textBody + textTail;
        const values = [userId];

        const orderItemInfo = await db.executeQuery(text, values);

        return orderItemInfo;

    } catch (error) {
        throw (error);
    }
};


const createOrder = async (total, user_id, quantity) => {
    try {
        const textHead = 'INSERT INTO order_info (created, total, status, user_id, quantity) ';
        const textTail = "VALUES (NOW(), $1, 'pending', $2, $3) RETURNING *";
        const text = textHead + textTail;
        const values = [total, user_id, quantity];

        const resOrderInfo = await db.executeQuery(text, values);

        if (resOrderInfo.length===0 || !resOrderInfo) {
            throw new Error('Error on creating order.');
        };

        return resOrderInfo;

    } catch (error) {
        throw(error);
    }
};

const createOrderItem = async (checkoutItemInfo) => {
    try {
        const text = 'INSERT INTO order_item (created, quantity, price, order_id, product_id) VALUES (NOW(),$1,$2,$3,$4) RETURNING *;';

        let orderItemArray = [];
        
        for (let i=0; i < checkoutItemInfo.length; i++) {
            const {quantity, total_price, orderId, product_id} = checkoutItemInfo[i];
            const values = [quantity, total_price, orderId, product_id];

            const response = await db.executeQuery(text, values);

            return [...orderItemArray, response[0]];
        };

        return orderItemArray;

    } catch (error) {
        throw(error);
    }
};





module.exports = {
    getOrders, createOrder, generateCheckoutItemInfo, 
    createOrderItem
};