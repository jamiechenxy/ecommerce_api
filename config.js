require('dotenv').config();

const DB = {
    PGUSER: process.env.PGUSER,
    PGHOST: process.env.PGHOST,
    PGDATABASE: process.env.PGDATABASE,
    PGPWD: process.env.PGPWD,
    PGPORT: process.env.PGPORT,
    MAXCONN: process.env.MAXCONN,
}; 

const PORT = process.env.PORT || 4001;

const rounds = process.env.rounds;

const session_secret = process.env.SESSION_SCRET;

module.exports = {
    DB, PORT, rounds, session_secret
};
