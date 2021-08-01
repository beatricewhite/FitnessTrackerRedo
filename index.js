// Use the dotenv package, to create environment variables
require('dotenv').config();

// create the express server here
const  client  = require('./db/client');
const PORT = process.env.PORT || 3000;

client.connect(error => {
    if (error) {
        console.log("there was an error.", error)
    }
    else {
        console.log("connected to database.")
    }
});

const express = require('express');
const server = express();

const morgan = require('morgan');
const bodyParser = require('body-parser');

server.use(morgan('dev'));

server.use(bodyParser.json());

const cors = require('cors');
server.use(cors());

const apiRouter = require('./api');
server.use('/api', apiRouter);

server.use((err, req, res, next) => {
    var err = new Error("Page not found.");
    err.status = 404;
    next(err);
})

server.use('*', (err, req, res, next) => {
    res.status(500).send({message: err});
})



server.listen(PORT, () => {
    console.log('The server is up on port', PORT)
})