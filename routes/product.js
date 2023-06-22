const productRouter = require('express').Router();
const {
    getAllProducts, 
    getProductById,
} = require('../models/product');


productRouter.get('/', async (req, res, next) => {
    try {
        const result = await getAllProducts();

        if (!result) {
            res.status(404);
            throw new Error('The product not found.');
        };

        res.status(200).json(result);
        
    } catch(err) {
        next(err);
    }
});

productRouter.get('/:productiId', async (req, res, next) => {
    try {
        let paramsArray = [req.params.productiId];

        const result = await getProductById(paramsArray);

        if (!result) {
            res.status(404);
            throw new Error('The product not found.');
        };

        res.status(200).json(result);

    } catch(err) {
        next(err);
    }
});


module.exports = productRouter;