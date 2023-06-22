const authRouter = require('express').Router();
const bcrypt = require('bcrypt');
const rounds = require('../config');
const {
    createUser,
    findUserIdByEmail
} = require('../models/user');
require('../util/passport');
const passport = require('passport');

authRouter.post('/register', async (req, res, next) => {
    try {
        const {email, password} = req.query;
        const userId = await findUserIdByEmail(email);
    
        if (!userId || userId===undefined || userId.length !== 0) {
            res.status(400);
            throw new Error('The email is existed. Redirecting to login page.');
            // res.redirect('login');
        }; 
    
        const salt = await bcrypt.genSalt(Number(rounds));
        const hashed = await bcrypt.hash(password, salt);
    
        let valuesArray = Object.values(req.query);
        valuesArray[0] = hashed;
    
        const newUser = await createUser(valuesArray);
        
        if (!newUser || newUser===undefined || newUser.length===0) {
            res.status(500);
            throw new Error('Error occurred during user creation.');  
            // res.redirect('login');
        };
    
        res.status(201).send('Registered successfully.');
        
    } catch (error) {
        next(error);
    }
});

authRouter.get('/login', (req, res) => {
    res.json({ info: 'This is the login page.' });
    // res.render('login');
});

authRouter.post(
    '/login',
    passport.authenticate(('local'), { 
        successRedirect: '/api/users/profile',
        failureRedirect: '/api/auth/login', 
        failureMessage: true 
    }), 
    (req, res, next) => {    

        if (err) {
            next(err);
        };

        if (!user) {
            res.status(404).send('User not found.');
        }

        res.status(200).send('Login successfully. Redirecting to profile page.');    

    }
);



module.exports = authRouter;
