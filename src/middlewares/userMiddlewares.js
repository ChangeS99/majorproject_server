const jwt = require("jsonwebtoken");

const User = require('../models/user');
 
exports.requireNormalUserSignedin = (req, res, next) => {
    const { user } = req.signedCookies;

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
                    error: "User not found"
                })
            }
            const roles = user.accountRoles.filter(obj => {
                return obj.name === "normal" && obj.type.name === "account"
            });

            if(roles.length < 1) {
                return res.status(400).json({
                    error: "You need to be an admin to access this page."
                })
            }

            next();
            // return res.json({
            //     roles,
            //     message: "Normal user verified."
            // });
        })

        // return res.status(400).json({
        //     error: "hah"
        // })
    })
}