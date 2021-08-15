const jwt = require("jsonwebtoken");

const Admin = require('../models/admin');

exports.requireAdminSignin = (req, res, next) => {
    const { admin } = req.signedCookies;

    if (!admin) {
        return res.status(401).json({
            error: "Not authorized"
        });
    }

    jwt.verify(admin, process.env.JWT_SECRET, async function (err, decoded) {

        if (err) {
            return res.status(400).json({
                error: "invalid token"
            })
        }

        const {_id, email} = decoded;

        Admin.findById(_id).then(admin => {
            next();
        }).catch(err => {
            return res.status(404).json({
                error: "Invalid User"
            })
        })
    })
}