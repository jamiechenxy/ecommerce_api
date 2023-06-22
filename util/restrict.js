
const checkAuthenticated =  (req, res, next) => {

    if (req.isAuthenticated()) {
        return next();
    };
    
    res.status(403).json({ message: 'Access denied. Please log in.' });
};

const compareId = (idInParams, idInUser) => idInParams == idInUser ? true : false;

const checkPayment = (amountRequired, amountOffered) => amountRequired===amountOffered ? true : false;


module.exports = {
    checkAuthenticated, compareId, checkPayment, 
};
