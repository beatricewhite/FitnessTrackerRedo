// build and export your unconnected client here

// Require the Client constructor from the pg package
const {Client} = require('pg');

// Create a constant, CONNECTION_STRING, from either process.env.DATABASE_URL or postgres://localhost:5432/fitness-dev
const CONNECTION_STRING = new Client(process.env.DATABASE_URL || 'postgres://localhost:5432/fitness-dev');

// Create the client using new Client(CONNECTION_STRING)
// UNCONNECTED CLIENT!!!!!!!!
const client = new Client(CONNECTION_STRING);



module.exports = client
