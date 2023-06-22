const ordersRouter = require('express').Router();
const { checkAuthenticated } = require('../util/restrict');
const { getOrders } = require('../models/orders');



ordersRouter.use(checkAuthenticated, (req, res, next) => {
    next();
});

ordersRouter.get('/mine', async (req, res, next) => {
    try {
        const orders = await getOrders(req.user.user_id);

        if (orders.length===0 || !orders) {
            throw new Error('No order records found.');
        };

        res.status(200).send(orders);

    } catch (error) {
        next(error);
    }
});

ordersRouter.get('/mine/:orderId', async (req, res, next) => {
    try {
        const orders = await getOrders(req.user.user_id, req.params.orderId);

        if (orders.length===0 || !orders) {
            throw new Error('No order records found.');
        };

        res.status(200).send(orders);

    } catch (error) {
        next(error);
    }
});






module.exports = ordersRouter;