const {DB} = require('../config');
const pgp = require('pg-promise')({ capSQL: true });

const cn = {
  user: DB.PGUSER,
  host: DB.PGHOST,
  database: DB.PGDATABASE,
  password: DB.PGPWD,
  port: DB.PGPORT,
  max: DB.MAXCONN, 
};

const db = pgp(cn);


const getClient = async () => {
    const client = await pool.connect();
    const query = client.query;
    const release = client.release;
    
    // set a timeout of 5 seconds, after which we will log this client's last query
    const timeout = setTimeout(() => {
      console.error('A client has been checked out for more than 5 seconds!');
      console.error(`The last executed query on this client was: ${client.lastQuery}`);
    }, 5000);

    // monkey patch the query method to keep track of the last query executed
    client.query = (...args) => {
      client.lastQuery = args;
      return query.apply(client, args);
    };

    client.release = () => {
      // clear our timeout
      clearTimeout(timeout);
      
      // set the methods back to their old un-monkey-patched version
      client.query = query;
      client.release = release;
      
      return release.apply(client);
    };
    return client;
};

const executeQuery = async (text, values) => {
    // const client = await getClient();
    try {
        const start = Date.now();
        // const res = await pool.query(text, values);
        const res = await db.any(text, values);

        const duration = Date.now() - start;
        // client.release();
        // await pool.end();
        console.log('executed query: ', { text, values, duration, rows: res.length });
        // console.log('client has disconnected.');
        return res;
    } catch(error) {
        throw error;
    }
};


module.exports = {
    executeQuery
};


