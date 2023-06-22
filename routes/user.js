const userRouter = require('express').Router();
const bcrypt = require('bcrypt');
const rounds = require('../config');
const { findUserById, updateUserById } = require('../models/user');
const { checkAuthenticated, compareId } = require('../util/restrict');


userRouter.use(checkAuthenticated, (req, res, next) => {
    try {
        next();
    } catch (error) {
        next(error);
    }
});

userRouter.get('/profile', (req, res, next) => {
    try {
        res.json({ info: `Hi, ${req.user.first_name}! It's good to see you. Happy shopping with us!` });  
    } catch (error) {
        next(error);
    }
});

userRouter.get('/:userId', async (req, res, next) => {
    try {
        const matchId = compareId(req.params.userId, req.user.user_id);

        if(!matchId) {
            res.status(400);
            throw new Error('Bad request. Only authorized to your own account.');
        };

        const response = await findUserById(req.user.user_id);

        if (!response || response===undefined) {
            res.status(404);
            throw new Error('User not found.');
        };
    
        res.status(202).send(response);
        
    } catch (error) {
        next(error);
    }
});

userRouter.put('/:userId', async (req, res, next) => {
    try {

        const matchId = compareId(req.params.userId, req.user.user_id);

        if(!matchId) {
            res.status(400);
            throw new Error('Bad request. Only authorized to your own account.');
        };

        // check if the authorized user requires to check password.
        const queryObj = req.query;
        const detectpsw = Object.keys(queryObj).includes('password');
        if (detectpsw) {
            const salt = await bcrypt.genSalt(Number(rounds));
            const hashed = await bcrypt.hash(req.query.password, salt);
            queryObj.password = hashed;
        };

        // check if the columns from req.query match the columns of user form at database.
        // then only update the matched columns (beside 'user_id', need to filter out during process).
        const queryArray = Object.entries(queryObj);
        const keysInUser = Object.keys(req.user);

        const valuesArray = queryArray.filter((arr) => keysInUser.includes(arr[0], 1));

        if (!valuesArray || valuesArray === undefined) {
            res.status(300);
            throw new Error('Invalid requested data.');
        };

        const record = await updateUserById(valuesArray, req.params.userId);

        if (!record || record===undefined) {
            res.status(500);
            throw new Error('Error during updating user information.');
        };

        res.status(202).send('user information has been updated.');
        
    } catch (error) {
        next(error);
    }
});



module.exports = userRouter;