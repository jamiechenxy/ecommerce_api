const db = require('../db/index');

const findUserById = async (id) => {
    try {
        const text = 'SELECT * FROM user_info WHERE user_id = $1';
        const values = [id];

        const user = await db.executeQuery(text, values);

        return user;

    } catch(err) {
        throw err;
    }
};

const findUserIdByEmail = async (email) => {
    try {
        const text = 'SELECT user_id FROM user_info WHERE email = $1';
        const values = [email];

        const userId = await db.executeQuery(text, values);

        return userId;

    } catch(err) {
        throw err;
    }
};

const findUserByEmail = async (email) => {
    try {
        const text = 'SELECT * FROM user_info WHERE email = $1';
        const values = [email];

        const user = await db.executeQuery(text, values);

        return user;

    } catch(err) {
        throw err;
    }
};

const createUser = async (valuesArray) => {
    try {
        const textHead = 'INSERT INTO user_info (password, email, first_name, last_name, created) ';
        const textTail = 'VALUES ($1, $2, $3, $4, NOW()) RETURNING *';
        const text = textHead + textTail;
        values = valuesArray;

        const newUser = await db.executeQuery(text, values);

        return newUser;

    } catch(err) {
        throw err;
    }
};

const updateUserById = async (valuesArray, id) => {
    try {
        valuesArray.push(['modified', 'NOW()']);
    
        const textHead = 'UPDATE user_info ';
        const textBody = 'SET $1~ = $2 WHERE user_id = $3 RETURNING *';
        const text = textHead + textBody;
            
        for (let i=0; i < valuesArray.length; i++) {
    
            let values = [valuesArray[i][0], valuesArray[i][1], id];
    
            const result = await db.executeQuery(text, values);
        
            if (i===valuesArray.length-1) {
                const record = result[0];
                return record;
            };
        };
        
        return record;

    } catch (error) {
        throw error;
    }
};


const verifyUserByEmail = async(email, cb) => {
    process.nextTick(async function() {

        const result = await findUserByEmail(email);

        if (result.length === 0) {
            return cb(null, false);
        };

        const record = result[0];
        if (record.email === email) {
            return cb(null, record);
        };

        return cb(null, null);

    })
};

const verifyUserById = async(id, cb) => {
    process.nextTick(async function() {
        
        const result = await findUserById(id);

        if (result.length === 0) {
            return cb(null, false);
        };

        const record = result[0];
        if (record.user_id === id) {
            return cb(null, record);
        };

        return cb(null, null);

    })
};


module.exports = {
    createUser, findUserIdByEmail, 
    findUserByEmail, verifyUserByEmail, 
    findUserById, verifyUserById,
    updateUserById,
};