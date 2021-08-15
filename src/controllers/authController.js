const User = require('../models/user');
const Temp = require('../models/temp');
const Hospital = require('../models/hospital');
const Role = require('../models/role');

const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// POST /api/auth/signup
// for normal users
exports.signup_POST = async (req, res) => {
    const { username, email, password, hospitalAdmin } = req.body;

    await User.findOne({ $or: [{ email }, { username }] }).exec((err, user) => {
        if (err || user) {
            return res.status(400).json({
                error: "User already exist"
            })
        }

        Temp.findOne({ email }).exec(async (err, savedTemp) => {
            if (err || savedTemp) {
                return res.status(400).json({
                    error: "email already sent",
                    path: "temp"
                })
            }

            let tokenObject;
            if (hospitalAdmin) {
                tokenObject = {
                    username, email, password, hospitalAdmin
                }
            } else {
                tokenObject = {
                    username, email, password
                }
            }

            const token = jwt.sign(tokenObject, process.env.JWT_ACCOUNT_ACTIVATION, {
                expiresIn: '10m'
            });

            const emailData = {
                from: process.env.EMAIL_FROM,
                to: email,
                subject: `Account activation link`,
                html: `
                <p>Please use the following link to activate your account</p>
                <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
                <hr />
                <p>${process.env.CLIENT_URL}</p>
                `
            }

            const newTemp = new Temp({
                email
            });

            await newTemp.save();

            sgMail.send(emailData)
                .then(sent => {
                    return res.json({
                        message: `email has been sent to ${email}`
                    })
                })
                .catch(err => {
                    console.log(err);
                    return res.status(400).json({
                        error: err.message
                    })
                });
        })
    })
}

//POST /api/auth/account-activation
exports.accountActivation_POST = async (req, res) => {

    const { token } = req.body;

    if (!token) {
        return res.status(401).json({
            error: 'Token Error'
        });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, async function (err, decoded) {
        if (err) {
            return res.status(401).json({
                error: "expired link."
            })
        }

        const { username, email, password, hospitalAdmin } = jwt.decode(token);

        const user = new User({ username, email, password });

        const setRole = await user.setRole("normal", "account");

        if (setRole instanceof Error) {
            console.log(setRole)
            return res.json({
                error: setRole.message
            })
        }

        const authToken = jwt.sign({ _id: user._id, username, email }, process.env.JWT_SECRET, {
            expiresIn: '28d'
        });

        Temp.deleteOne({ email }).exec((err, removed) => {

            user.save((err, user) => {
                if (err) {
                    console.log(err);
                    return res.status(401).json({
                        error: 'Error during saving of user'
                    });
                }

                res.cookie('user', authToken, {
                    maxAge: 1000 * 60 * 60 * 24 * 28,
                    httpOnly: true,
                    signed: true
                })
                return res.status(201).json({
                    token: authToken,
                    user: { _id: user._id, username, email },
                    message: "User successfully signed up"
                })
            })

        })
    })
}

//POST /api/auth/signin

exports.signin_POST = async (req, res) => {
    const { email, password } = req.body;

    User.findOne({ email }).exec(async (err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: "Invalid email or password",
                secretError: "User not found"
            })
        }

        if (!user.authenticate(password)) {
            return res.status(400).json({
                error: "Invalid email or password"
            });
        }

        const { _id, username, email } = user;

        const hospital = await Hospital.findOne({admins: _id}).catch(_ => {
            return res.status(400).json({
                error: "Error finding hospital"
            })
        })

        if(hospital) {
            const hospitalToken = jwt.sign({ _id: hospital._id, email: hospital.email }, process.env.JWT_SECRET, {
                expiresIn: '28d'
            });

            res.cookie('hospital', hospitalToken, {
                maxAge: 1000 * 60 * 60 * 24 * 28,
                httpOnly: true,
                signed: true
            })
        }

        const token = jwt.sign({ _id: user._id, email }, process.env.JWT_SECRET, {
            expiresIn: '28d'
        });

        res.cookie('user', token, {
            maxAge: 1000 * 60 * 60 * 24 * 28,
            httpOnly: true,
            signed: true
        })

        return res.status(200).json({
            token,
            user: { _id, username, email },
            message: `${username} signed in successfully.`
        })
    })
}

//POST /api/auth/resignin
exports.reSignin_POST = async (req, res) => {
    const { token } = req.body;
    const { user } = req.signedCookies;

    jwt.verify(user, process.env.JWT_SECRET, function (err, decoded) {
        if (err) {
            return res.status(401).json({
                error: "expired token"
            })
        }

        const { _id } = jwt.decode(token);

        User.findById(_id).exec((err, user) => {
            if (err || !user) {
                return res.status(404).json({
                    error: "User not found"
                })
            }

            const token = jwt.sign({ _id: user._id, email: user.email }, process.env.JWT_SECRET, {
                expiresIn: '28d'
            });

            const { _id, username, email } = user;

            res.cookie('user', token, {
                maxAge: 1000 * 60 * 60 * 24 * 28,
                httpOnly: true,
                signed: true
            })

            return res.status(200).json({
                token,
                user: { _id, username, email },
                message: "User successfully (re)signed in."
            })
        })
    })
}

//POST /api/auth/signout
exports.signout_POST = (req, res) => {
    const user = req.user;

    if (!user) {
        return res.status(400).json({
            error: "User not signed in."
        });
    }
    const token = "aaa";
    res.cookie('user', token, {
        maxAge: 0,
        httpOnly: true,
        signed: true
    });

    res.cookie('hospital', token, {
        maxAge: 0,
        httpOnly: true,
        signed: true 
    })

    return res.json({
        message: "User successfully signed out."
    })
}


