const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/user');
const {app} = require('../server');


passport.serializeUser((user, done) => {
    done(null, user.user_id);
});

passport.deserializeUser(async (user_id, done) => {
    try {
        const result = await User.findUserById(user_id);

        if (!result || result.length === 0) throw new Error('User not found.');

        const user = result[0];
        return done(null, user);

    } catch (error) {
        done(error, null);
    }
});


passport.use(new LocalStrategy({
        usernameField: 'email'
    }, 
    function(email, password, done) {
        
        User.verifyUserByEmail(email, async (err, user) => {

            if(err) return done(err);

            if(!user) return done(null, false, { message: "Incorrect email or password." });

            const matched = await bcrypt.compare(password, user.password);

            if(!matched) return done(null, false), { message: "Incorrect email or password." };

            return done(null, user);
            
        })
    }
));




module.exports = {
    passport
};


