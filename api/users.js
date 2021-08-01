require('dotenv').config()
const express = require('express');
const usersRouter = express.Router();
const jwt = require('jsonwebtoken');
const { requireUser } = require('./utils')



// usersRouter.use((req, res, next) => {
//     console.log("A request is being made to /users");

//     // res.send({ message: 'hello from /users!'});
//     next();
// });

const { getAllUsers, getPublicRoutinesByUser, createUser, getUserByUserName, getUser, getUserById } = require('../db');



//POST /users/register
//need to incorporate hashing password
usersRouter.post('/register', async (req, res, next) => {
    const { username, password } = req.body;

    try {
        const _user = await getUserByUserName(username);

        if (_user) {
            return res.status(400).send({
                name: 'UserExistsError',
                message: 'A user by that username already exists'
            });
        }
        if (password.length < 8) {
            return res.status(400).send({
                name: 'PasswordLengthError',
                message: 'Password must have at least 8 characters'
            })
        }

        const user = await createUser({
            username,
            password,
        });
        console.log("user from register", user)
        const token = jwt.sign({
            id: user.id,
            username
        }, process.env.JWT_SECRET, {
            expiresIn: '1w'
        });

        res.send({
            message: "thank you for signing up",
            token,
            user
        });
    } catch ({ name, message }) {
        res.status(403).send({ name, message })
    }
})


//POST /users/login
// usersRouter.get('/test', (req,res,next) => {
//     res.send('test route')
// });
usersRouter.post('/login', async (req, res, next) => {
    const { username, password } = req.body;
    // console.log(username, password)
    //requests need both
    if (!username || !password) {
        return res.status(403).send({
            name: "MissingLoginError",
            message: "Please provide both a username and password"
        });
    }

    try {
        const user = await getUser({ username, password });
        console.log(user)
        if (!user) {
            return res.status(403).send({
                name: "IncorrectLoginError",
                message: "Incorrect login information"
            })
        }
        else {
            //create token and return to user
            const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET);

            res.send({
                message: "you're logged in!",
                token,
                user
            });
        }
    } catch (error) {
        console.log(error);
        next(error);
    }

})



//GET /users/me

usersRouter.get("/me", requireUser, async (req, res, next) => {
    const prefix = "Bearer ";
    const auth = req.header("Authorization");

    if (!auth) {
        next({
            name: "AuthorizationError",
            message: 'Authorization is required'
        })
    } else if (auth.startsWith(prefix)) {
        const token = auth.slice(prefix.length);
        console.log("token from user/me", token)
        try {
            const { id } = jwt.verify(token, process.env.JWT_SECRET);
            console.log("id from user/me", id)
            if (id) {
                const user = await getUserById(id);
                console.log("user from user/me", user)
                return res.send(
                    user
                );
            }
            else {
                console.log('id is null from jwt verify')
            }
        } catch (error) {
            console.error("there was an error fetching the user at /me")
            res.send("error fetching the user at /me")
        }
    }
});


// GET /users/:username/routines

usersRouter.get('/:username/routines', async (req, res) => {


    let username = req.params.username

    const userWithRoutines = await getPublicRoutinesByUser({ username });

    res.send(userWithRoutines,);
});


module.exports = usersRouter;