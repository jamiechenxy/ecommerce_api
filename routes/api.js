const express = require('express');
const apiRouter = express.Router();

const productRouter = require('./product');
const userRouter = require('./user');
const authRouter = require('./auth');
const cartRouter = require('./cart');
const ordersRouter = require('./orders');


apiRouter.use('/product', productRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/cart', cartRouter);
apiRouter.use('/orders', ordersRouter);

module.exports = apiRouter;
