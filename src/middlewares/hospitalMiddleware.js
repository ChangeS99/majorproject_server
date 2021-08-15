const jwt = require('jsonwebtoken');
const ObjectId = require('mongoose').Types.ObjectId;

//models
const User = require('../models/user');
const Hospital = require('../models/hospital');


exports.verifyHospitalCookie = (req, res, next) => {
    const { hospital, user } = req.signedCookies;

    if (!user || !hospital) {
        return res.status(401).json({
            error: "Not authorized"
        });
    }

    jwt.verify(hospital, process.env.JWT_HOSPITAL_SECRET, function (err, hospDecoded) {

        if (err) {
            return res.status(400).json({
                error: "invalid token"
            })
        }
        jwt.verify(user, process.env.JWT_SECRET, function (err, userDecoded) {
            const { _id: hospitalId } = hospDecoded
            const { _id: userId } = userDecoded;

            User.findById(userId)
                .then(user => {
                    Hospital.findById(hospitalId)
                        .then(hosp => {
    
                            const exist = hosp.admins.find(item => item.equals(user._id));

                            if (exist) {
                                req.userId = user._id;
                                req.hospitalId = hosp._id;
                                next();
                            } else {
                                return res.status(400).json({
                                    error: "Not authorized"
                                })
                            }


                        })
                        .catch(err => {
                            console.log(err);
                            return res.status(400).json({
                                error: "Not verified."
                            })
                        })
                })
                .catch(err => {
                    console.log(err);
                    return res.status(404).json({
                        error: "Invalid User"
                    })
                })
        })
    })
}