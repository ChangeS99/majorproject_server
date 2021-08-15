const jwt = require("jsonwebtoken");

const User = require('../models/user');

//post /api/user/normal/verify
exports.verifyNormalUser_POST = (req, res, next) => {
    const { user } = req.signedCookies;

    const {role, type} = req.body;

    if(!role || !type) {
        return res.status(400).json({
            error: "server error."
        })
    }

    jwt.verify(user, process.env.JWT_SECRET, (err, decoded) => {

        if (err) {
            return res.status(400).json({
                error: "You need to be signed in to access this page."
            });
        }

        const { _id } = decoded;

        User.findById(_id).exec((err, user) => {
            if (err || !user) {
                return res.status(400).json({
                    error: "User not signed in."
                })
            }
            const roles = user.accountRoles.filter(obj => {
                return obj.name === role && obj.type.name === type
            });

            return res.json({
                roles,
                message: "Normal user verified."
            });
        })

        // return res.status(400).json({
        //     error: "hah"
        // })
    })
}