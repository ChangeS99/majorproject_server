const Admin = require('../models/admin');
const Type = require('../models/type');
const Role = require('../models/role');

const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//POST /api/auth/admin/signup
exports.adminSignup_POST = async (req, res) => {
    const {username, email, password} = req.body;

    try {

        const adminExist = await Admin.findOne({$or:[{email}, {username}]});
        if(adminExist) {
            return res.status(400).json({
                error: "Admin already exists"
            })
        }
 

        const token = jwt.sign({ username, email, password }, process.env.JWT_ACCOUNT_ACTIVATION, {
            expiresIn: '10m'
        });

        const emailData = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `Admin Account activation link`,
            html: `
            <p>Please use the following link to activate your admin account</p>
            <p>${process.env.CLIENT_URL}/auth/admin/activate/${token}</p>
            <hr />
            <p>${process.env.CLIENT_URL}</p>
            `
        }

        sgMail.send(emailData)
            .then(sent => {
                return res.json({
                    message: `email has been sent to ${email}`
                })
            })
            .catch(err => {
                return res.status(400).json({
                    error: err.message
                })
            });

        

    } catch(err) {
        return res.status(400).json({
            error: "Could not create admin. Please try again."
        })
    }
}

//POST /api/auth/account-activation

exports.adminAccountActivation_POST = async (req, res) => {

    const { token } = req.body;

    if(!token) {
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
        console.log(decoded);

        const { username, email, password } = jwt.decode(token);

        const admin = new Admin({
            username, email, password
        });

        const setRole = await admin.setRole("admin", "application");
        if(setRole instanceof Error) {
            return res.status(400).json({
                error: setRole.message
            });  
        }

        admin.save((err, savedAdmin) => {
            if(err) {
                console.log(err);
                return res.status(400).json({
                    error: "Could not save admin account."
                });
            }
            const {_id, email, username } = savedAdmin;
            return res.status(201).json({
                message: "Admin account created successfully",
                admin: {_id, email, username }
            })
        })      
    })
}

//POST /api/auth/admin/signin
exports.adminSignin_POST = async (req, res) => {
    const { email, password } = req.body;  

    Admin.findOne({ email }).exec((err, admin) => {
        if (err || !admin) {
            return res.status(400).json({
                error: "Invalid email or password",
                secretError: "Admin not found"
            })
        }

        if (!admin.authenticate(password)) {
            return res.status(400).json({
                error: "Invalid email or password"
            });
        }

        const { _id, username, email, accountRoles } = admin;

        const token = jwt.sign({ _id, email }, process.env.JWT_SECRET, {
            expiresIn: '28d'
        });

        res.cookie('admin', token, {
            maxAge: 1000 * 60 * 60 * 24 * 28,
            httpOnly: true,
            signed: true
        })

        return res.status(200).json({
            token,
            admin: { _id, username, email, accountRoles },
            message: `${username} signed in successfully.`
        })
    })
}

