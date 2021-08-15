const jwt = require("jsonwebtoken");

const User = require('../models/user');

exports.requireUserSignin = (req, res, next) => {
    const { user } = req.signedCookies;

    if (!user) {
        return res.status(401).json({
            error: "Not authorized"
        });
    }

    jwt.verify(user, process.env.JWT_SECRET, async function (err, decoded) {

        if (err) {
            return res.status(400).json({
                error: "invalid token"
            })
        }

        const {_id, email} = decoded;

        User.findById(_id).then(user => {
            req.user = user;
            next();
        }).catch(err => {
            return res.status(404).json({
                error: "Invalid User"
            })
        })
    })
}