const jwt = require('jsonwebtoken');


function requireUser(req, res, next) {
    if(!req.headers.authorization) {
        return res.status(403).send("No valid token")
    }
    const token = req.headers.authorization.split(" ")[1]

    const user = jwt.decode(token)


    if (!user) {
        return res.status(403).send({
            name: "MissingUserError",
            message: "You must be logged in to perform this action"
        });
    }
    req.user = user

    next();
}

module.exports = {
    requireUser
}