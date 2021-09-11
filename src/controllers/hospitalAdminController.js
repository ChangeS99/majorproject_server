const User = require('../models/user');
const Hospital = require('../models/hospital');
const Employee = require('../models/employee');
const Patient = require('../models/patient');
const Type = require('../models/type');
const Role = require('../models/role');
const Temp = require('../models/temp');
const Announcement = require('../models/announcement');

const {
    fields
} = require('./utility');

const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');


sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//POSt /api/hospital/admin/create
exports.adminHospitalCreate_POST = async (req, res) => {

    const hospitalId = req.hospitalId;
    const { email } = req.body;

    const temp = await Temp.findOne({ $and: [{ email }, { forHospitalAdmin: true }] }).catch(error => {
        return res.status(400).json({
            error: "Error finding temp data."
        })
    })

    if (temp) {
        console.log(temp);
        return res.status(400).json({
            error: "Email already sent."
        })
    }

    const userExist = await User.findOne({ email }).catch(error => {
        return res.status(400).json({
            error: "Error finding user."
        })
    });

    if (userExist) {
        // console.log(userExist);
        const isAdmin = userExist.accountRoles.find(item => {
            return item.type.typeId.equals(hospitalId);
        });

        if (isAdmin) {
            return res.status(400).json({
                error: "User is already an admin."
            })
        }

    }

    let tokenObject = {
        email,
        hospitalId,
        exist: false,
    }

    if (userExist) {
        tokenObject.exist = true;
    }

    const token = jwt.sign(tokenObject, process.env.JWT_ACCOUNT_ACTIVATION, {
        expiresIn: '10m'
    });

    const emailData = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: `Account activation link`,
        html: `
        <p>Please use the following link to create an admin account</p>
        <p>${process.env.CLIENT_URL}/hospital/admin/activate/${token}</p>
        <hr />
        <p>${process.env.CLIENT_URL}</p>
        `
    }

    const newTemp = new Temp({
        email,
        forHospitalAdmin: true
    });

    await newTemp.save();

    sgMail.send(emailData)
        .then(sent => {
            return res.json({
                message: `email has been sent to ${email}`
            })
        })
        .catch(err => {
            // console.log(err);
            return res.status(400).json({
                error: err.message
            })
        });
}

//POST /api/hospital/admin/activate/verify
exports.adminHospitalActivateVerify_POST = (req, res) => {
    const { token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, async function (err, decoded) {

        if (err) {
            return res.status(400).json({
                error: "Invalid Token"
            })
        }

        return res.json({
            message: "Verified",
            email: decoded.email,
            exist: decoded.exist
        })
    })
}

//POST /api/hospital/admin/account-activation
exports.adminHospitalCreateActivate_POST = async (req, res) => {
    const { token, username, password } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, async function (err, decoded) {

        if (err) {
            return res.status(400).json({
                error: "Invalid Token"
            })
        }

        const { email, hospitalId, exist } = decoded;

        const hospital = await Hospital.findById(hospitalId).catch(_ => {
            return res.status(400).json({
                error: "Error finding hospital."
            })
        })

        if (!hospital) {
            return res.status(400).json({
                error: "No hospital found."
            })
        }

        const role = await Role.findOne({ $and: [{ name: "admin" }, { "type.typeId": hospitalId }] }).catch(_ => {
            return res.status(400).json({
                error: "Error finding role"
            })
        });

        if (!role) {
            return res.status(404).json({
                error: "Role not found"
            })
        }

        const user = await User.findOne({ email }).catch(error => {
            return res.status(400).json({
                error: "Error finding user."
            })
        })


        if (user) {
            const isAlreadyActivated = hospital.admins.find(item => item.equals(user._id));

            if (isAlreadyActivated) {
                return res.status(400).json({
                    error: "User is already an admin."
                })
            }

            const newAdminList = [...hospital.admins, user._id];
            hospital.admins = [...newAdminList];
            await hospital.save().catch(_ => {
                return res.status(400).json({
                    error: "Error updating hospital."
                })
            })

            const newRoleList = [...user.accountRoles, role];
            user.accountRoles = [...newRoleList];
            await user.save().catch(_ => {
                return res.status(400).json({
                    error: "Error updating user."
                })
            })
            const hospitalToken = jwt.sign({ _id: hospital._id, email: hospital.email }, process.env.JWT_HOSPITAL_SECRET, {
                expiresIn: '28d'
            });

            const authToken = jwt.sign({ _id: user._id, username, email }, process.env.JWT_SECRET, {
                expiresIn: '28d'
            });

            if (!req.signedCookies.user || !req.signedCookies.hospital) {
                res.cookie('hospital', hospitalToken, {
                    maxAge: 1000 * 60 * 60 * 24 * 28,
                    httpOnly: true,
                    signed: true
                });

                res.cookie('user', authToken, {
                    maxAge: 1000 * 60 * 60 * 24 * 28,
                    httpOnly: true,
                    signed: true
                });
            }

            await Temp.deleteOne({ email, forHospitalAdmin: true }).catch(_ => {
                return res.status(500).json({
                    error: "Error deleting temp document"
                })
            })

            return res.status(201).json({
                message: `Successfully created admin account for hospital: ${hospital.name}`,
                user
            })
        }

        const newUser = new User({
            username, email, password
        });

        const setRole = await newUser.setRole("normal", "account");

        if (setRole instanceof Error) {
            return res.json({
                error: setRole.message
            })
        }

        const newAdminList = [...hospital.admins, newUser._id];
        hospital.admins = [...newAdminList];
        await hospital.save().catch(_ => {
            return res.status(400).json({
                error: "Error updating hospital."
            })
        })

        const newRoleList = [...newUser.accountRoles, role];
        newUser.accountRoles = [...newRoleList];
        await newUser.save().catch(_ => {
            return res.status(400).json({
                error: "Error updating user."
            })
        })

        const authToken = jwt.sign({ _id: newUser._id, username, email }, process.env.JWT_SECRET, {
            expiresIn: '28d'
        });
        const hospitalToken = jwt.sign({ _id: hospital._id, email: hospital.email }, process.env.JWT_HOSPITAL_SECRET, {
            expiresIn: '28d'
        });

        await Temp.deleteOne({ email, forHospitalAdmin: true }).catch(_ => {
            return res.status(500).json({
                error: "Error deleting temp document"
            })
        });

        if (!req.signedCookies.user || !req.signedCookies.hospital) {
            res.cookie('hospital', hospitalToken, {
                maxAge: 1000 * 60 * 60 * 24 * 28,
                httpOnly: true,
                signed: true
            });

            res.cookie('user', authToken, {
                maxAge: 1000 * 60 * 60 * 24 * 28,
                httpOnly: true,
                signed: true
            });
        }

        return res.status(201).json({
            message: `Successfully created admin account for hospital: ${hospital.name}`,
            user: newUser
        })
    })
}

//DELETE /api/hospital/admin/delete
exports.adminHospitalDelete_DELETE = async (req, res) => {
    const { _id } = req.body;
    const hospitalId = req.hospitalId;
    const userId = req.userId;

    if (userId.equals(_id)) {
        return res.status(400).json({
            error: "Cannot delete the signed in account. Please use another admin account to delete it."
        })
    }

    const user = await User.findOne({ $and: [{ _id }, { "accountRoles.type.typeId": hospitalId }] }).catch(_ => {
        return res.status(400).json({
            error: "Error finding hospital"
        })
    })

    if (!user) {
        return res.status(400).json({
            error: "User is not an admin."
        })
    }

    const hospital = await Hospital.findById(hospitalId).catch(_ => {
        return res.status(400).json({
            error: "Error finding hospital"
        })
    })

    if (!hospital) {
        return res.status(400).json({
            error: "Hospital not found."
        })
    }

    const newAdminList = hospital.admins.filter(item => !item.equals(_id));
    hospital.admins = [...newAdminList];

    const newAccountRoles = user.accountRoles.filter(item => {
        return !item.type.typeId.equals(hospitalId)
    })
    user.accountRoles = [...newAccountRoles];

    try {
        await user.save();
        await hospital.save();
        // console.log("user: ",user);
        // console.log("hospital: ", hospital);

        return res.json({
            message: "Successfully deleted"
        })
    } catch (error) {
        return res.status(400).json({
            error: "Could not delete the given admin.",
            message: error.message
        })
    }

}

//POST /api/hospital/admin/list
exports.adminHospitalList_POST = (req, res) => {
    const hospitalId = req.hospitalId;

    User.find({ "accountRoles.type.typeId": hospitalId }).select('email username _id').exec((err, admins) => {
        if (err || !admins) {
            return res.status(400).json({
                error: "admin not found."
            })
        }

        return res.json({
            admins
        })
    })
}

//POST /api/hospital/admin/search
exports.adminHospitalSearch_POST = async (req, res) => {
    const hospitalId = req.hospitalId;
    const { filter, search } = req.body;

    if (search.trim().length < 1) {
        return res.json([]);
    }

    const admins = await User.find({ "accountRoles.type.typeId": hospitalId })
        .fuzzySearch({ query: search, minSize: 3 });

    return res.json(admins);

}

//POST /api/hospital/admin/announcement/create
exports.adminAnnouncementCreate_POST = async (req, res) => {
    const hospitalId = req.hospitalId;
    const { title, field, detail, specific } = req.body;

    if (!title.length >= 1 || !detail.length >= 1 || !field.length >= 1) {
        return res.status(400).json({
            error: "Required values are not provided."
        })
    }

    const hospital = await Hospital.findById(hospitalId).catch(_ => {
        return res.status(400).json({
            error: "Error finding hospital"
        })
    });

    const fieldExist = Object.values(fields).find(item => item === field);

    if (!fieldExist) {
        return res.status(404).json({
            error: "Given field doesn't exist."
        })
    }

    const annExist = await Announcement.findOne({ title, field }).catch(_ => {
        return res.status(400).json({
            error: "Error finding announcement"
        })
    });

    if (annExist) {
        return res.status(400).json({
            error: "Announcement with the title already exists for the given field."
        })
    }

    let list = [];

    if (!specific.length >= 1) {
        switch (field) {
            case fields.admin: list = await User.find({ "accountRoles.type.typeId": hospitalId })
                .select('email')
                .catch(_ => {
                    return res.status(500).json({
                        error: "Error finding admins."
                    })
                }); break;
            case fields.patient: list = await Patient.find({ hospitalId }).select("contact -_id")
                .catch(_ => {
                    return res.status(500).json({
                        error: "Error finding patients."
                    })
                }); break;
            case fields.employee: list = await Employee.find({ hospitalId }).select("contact -id")
                .catch(_ => {
                    return res.status(500).json({
                        error: "Error finding employees."
                    })
                }); break;
            default: list = [];
        }

        if (!list.length >= 1) {
            return res.status(404).json({
                error: `no ${field} found`
            })
        }
    } else {

        try {
            switch (field) {
                case fields.employee: list = await Employee.find({ $and: [{ hospitalId }, { "contact.email": specific }] })
                    .select("contact")
                    ; break;
                case fields.patient: list = await Patient.find({ $and: [{ hospitalId }, { "contact.email": specific }] })
                    .select("contact")
                    ; break;
            }
        } catch (error) {

            return res.status(500).json({
                error: "Server error."
            })
        }


        if (!list.length >= 1) {
            return res.status(404).json({
                error: `no ${field} found with email ${specific}`
            })
        }
    }



    const emailList = list.map(item => item.contact.email);
    const phoneList = list.map(item => item.contact.phone);

    // return res.json({
    //     message: "try",
    //     list: [...emailList]
    // })

    const announcement = new Announcement({
        title,
        field,
        detail,
        recipients: {
            emails: [...emailList]
        },
        hospitalId
    });

    const emailData = {
        from: process.env.EMAIL_FROM,
        to: [...emailList],
        subject: title,
        html: `
        <p>${detail}</p>
        `
    }

    sgMail.send(emailData)
        .then(sent => {

            announcement.save((err, ann) => {
                if (err) {
                    return res.status(400).json({
                        error: "Error saving announcement"
                    })
                }

                const newAnnList = [...hospital.announcements, ann._id];
                hospital.announcements = [...newAnnList];
                hospital.save((err, hosp) => {
                    if (err) {
                        return res.status(400).json({
                            error: "Error saving hospital."
                        })
                    }

                    return res.status(201).json({
                        message: "Announcement sent successfully",
                        announcement
                    })
                })
            });

        })
        .catch(err => {
            // console.log(err);
            return res.status(400).json({
                error: err.message
            })
        });




}

//POST /api/hospital/admin/announcement/find
exports.adminAnnouncementFind_POST = async (req, res) => {
    const hospitalId = req.hospitalId;
    const { field } = req.body;

    // const hospital = await Hospital.findById(hospitalId).catch(_ => {
    //     return res.status(400).json({
    //         error: "Error finding hospital"
    //     })
    // });

    const fieldExist = Object.values(fields).find(item => item === field);
    if (!fieldExist) {
        return res.status(404).json({
            error: "Given field not found."
        })
    }

    const announcements = await Announcement.find({ $and: [{ field }, { hospitalId }] }).sort({ "createdAt": "desc" }).limit(10);

    return res.json({
        announcements
    })

}

//POST /api/hospital/admin/announcement/search
exports.adminAnnouncementSearch_POST = async (req, res) => {
    const hospitalId = req.hospitalId;
    const { query, filter } = req.body;

    if (query.length < 1) {
        return res.json({
            result: []
        });
    }

    const announcements = await Announcement.find({ $and: [{ field: filter }, { hospitalId }] })
        .fuzzySearch({ query, minSize: 3 }).sort({ "createdAt": "desc" }).select("title field detail");

    return res.json({
        result: announcements
    })
}
