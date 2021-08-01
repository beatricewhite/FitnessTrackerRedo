const SALT_COUNT = 10; //move into dotenv file
const client = require("./client");
const bcrypt = require('bcrypt');



async function createUser({
    username, 
    password  
}) {
    try {
        const hashedPassword = await bcrypt.hash(password, SALT_COUNT);
        const {rows: [user] } = await client.query(`
        INSERT INTO users(username, password)
        VALUES ('${username}', '${hashedPassword}')
        ON CONFLICT (username) DO NOTHING
        RETURNING *;
        `);
        if (user && user.password) {
        delete user.password;
        }
    
    return user;
    
    } catch(error) {
        console.error(error)
        throw error;
    }
}

async function getUser({
    username,
    password
}) {
    if (!username || !password) {
        return;
    }

    try {
        const user = await getUserByUserName(username);
        if(!user) return;
        const hashedPassword = user.password;
        const passwordsMatch = await bcrypt.compare(password, hashedPassword)
        if (passwordsMatch) {
            delete user.password;
            return user;
        }
        

    }catch (error) {
        console.log("Error in getUser.")
    }
}

async function getUserById(id){

    try {
        const{rows: [user]} = await client.query(`
        SELECT id, username
        FROM users
        WHERE id=${id};
        `)
        if (!user) {
            return null;
        }
        return user;
    } catch(error) {
        console.error("Error in getUserById")
        throw error
    }
}

async function getUserByUserName(username) {
    try {
        const {rows: [user]} = await client.query(`
        SELECT *
        FROM users
        WHERE username='${username}';
        `)
        return user;
    } catch(error) {
        console.error("Error in getUserByUserName", error)
        return null;
    }
}


module.exports = {
    createUser,
    getUser,
    getUserById,
    getUserByUserName
}