// create an api router
// attach other routers from files in this api directory (users, activities...)
// export the api router

// const { getAllRoutinesByUser } = require("../db");

const express = require('express');
const server = express();
const apiRouter = express.Router();

// const {client} = require('../db/client');
const jwt = require('jsonwebtoken');
const {getUserById} = require('../db');
const {JWT_SECRET} = process.env;


//GET /api/health
apiRouter.get("/health", async(req,res) => {
    try {
        res.send({ message: "All is well!" });
      } catch ({ name, message }) {
        next({ name, message });
      }
});

//usersRouter will try to match (now with /api/users removed from original matching path )
// and fire any middleware
server.use(async (req, res, next) => {
    const prefix = 'Bearer '
    const auth = req.headers['Authorization'];

    if (!auth) {
        next(); //we don't set req.user because there was no token passed in 
    }

    if (auth.startsWith(prefix)) {
        //recover the token:
        const token = auth.slice(prefix.length) //provides user authentication 
        try {
            //recover the data
            const {id} = jwt.verify(token, 'secret message');

            //get user from DB
            const user = await getUserById(id);
            //if user does not exist it might be null

            //attach the user
            req.user = user;


        } catch(error) {
            throw error;
        }
    }
})

apiRouter.use(async (req, res, next) => {
    const prefix = 'Bearer ';
    const auth = req.header('Authorization');

    if (!auth) {
        next();
    } else if (auth.startsWith(prefix)) {
        const token = auth.slice(prefix.length);

        try {
            const { id } = jwt.verify(token, JWT_SECRET);

            if (id) {
                req.user = await getUserById(id);
                next();
            }
        } catch ({
            name, message
        }) {
            next({name, message});
        }
    } else {
        next({
            name: 'AuthorizationHeaderError',
            message: `Authorization token must start with ${ prefix }`
        })
    }
})

//ROUTER: /api/users

const usersRouter = require('./users');
apiRouter.use('/users', usersRouter);


const activitiesRouter = require('./activities');
apiRouter.use('/activities', activitiesRouter);


const routinesRouter = require('./routines');
apiRouter.use('/routines', routinesRouter);

const routineActivitiesRouter = require('./routine_activities');
apiRouter.use('/routine_activities', routineActivitiesRouter);


//set `req.user` if possible
// router.use(async (req, res, next) => {
//     const prefix = 'Bearer ';
//     const authHeader = req.headers['authorization'];

//     if(authHeader && authHeader.startsWith(prefix)) {
//         const token = authHeader.slice(prefix.length);
//         const {id} = jwt.decode(token, JWT_SECRET);
//         const user = await getUserById(id);
//         req.user = user
//     } else {
//     next();
//     }
// });

// apiRouter.use((req, res, next) => {
//     if (req.user) {
//         console.log("User is set:", req.user);
//     }

//     next();
// })






apiRouter.use((error, req, res, next) => {
    res.send(error);
});

module.exports = apiRouter;