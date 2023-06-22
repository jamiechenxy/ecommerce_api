const db = require('../db/index');

const getAllProducts = async () => {
    try {
        const text = 'SELECT * FROM product ORDER BY product_id';

        const result = await db.executeQuery(text);

        return result;

    } catch (err) {
        throw err;
    } 
};

const getProductById = async(paramsArray) => {
    try{
        const text = 'SELECT * FROM product WHERE product_id = $1 ORDER BY product_id';
        const values = paramsArray;

        const result = await db.executeQuery(text, values);

        return result;

    } catch (err) {
        throw err;
    }
};


module.exports = {
    getAllProducts, getProductById
};
