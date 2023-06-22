const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const errorhandler = require('errorhandler');
const {PORT, session_secret} = require('./config');
const session = require('express-session');
const passport = require('passport');
const apiRouter = require('./routes/api');


app.use(
    session({
        secret: session_secret,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24,
            sameSite: 'none',
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


app.get('/', (req, res) => {
    res.json({ info: "Ecommerce server is running. It's the default page." })
});

app.use('/api', apiRouter);


app.use(errorhandler());

app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});
