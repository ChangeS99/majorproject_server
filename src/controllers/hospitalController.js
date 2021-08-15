const User = require('../models/user');
const Hospital = require('../models/hospital');
const Type = require('../models/type');
const Role = require('../models/role');
const HospitalRole = require('../models/hospitalRole');
const HospitalDep = require('../models/hospitalDep');

const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');


sgMail.setApiKey(process.env.SENDGRID_API_KEY);


// POST api/hospital/register
exports.hospitalRegister = (req, res) => {
    const { email, hospitalEmail } = req.body;

    const { hospital_register } = req.signedCookies;
    if (hospital_register) {
        return res.status(400).json({
            error: "Email already sent."
        })
    }

    Hospital.findOne({ email: hospitalEmail }).exec((err, hospital) => {
        if (err || hospital) {
            return res.status(400).json({
                error: "Hospital already exists on the platform. Try logging in."
            })
        }

        User.findOne({ email }).exec((err, user) => {
            if (err || !user) {
                return res.status(400).json({
                    error: "User not found"
                })
            }

            const token = jwt.sign({ email, hospitalEmail }, process.env.JWT_HOSPITAL_ACCOUNT_ACTIVATION, {
                expiresIn: '30m'
            });

            const emailData = {
                from: process.env.EMAIL_FROM,
                to: hospitalEmail,
                subject: `Hospital confirmation link`,
                html: `
                <p>Please use the following link to configure hospital details</p>
                <p>This link will only last for 30 minutes.</p>
                <p>Please try to configure within that time period.</p>
                <p>${process.env.CLIENT_URL}/hospital/register/configure/${token}</p>
                <hr />
                <p>${process.env.CLIENT_URL}</p>
                `
            }

            sgMail.send(emailData)
                .then(sent => {
                    res.cookie('hospital_register', token, {
                        maxAge: 1000 * 60 * 30,
                        httpOnly: true,
                        signed: true,
                    })
                    return res.json({
                        message: `email has been sent to ${hospitalEmail}`
                    })
                })
                .catch(err => {
                    return res.status(400).json({
                        error: err.message
                    })
                });
        })
    })
}


// POST api/hospital/register/verify
exports.verifyHospitalRegisterToken = (req, res) => {
    const { hospital_register } = req.signedCookies;
    const { token } = req.body;

    jwt.verify(token, process.env.JWT_HOSPITAL_ACCOUNT_ACTIVATION, (err, decoded) => {
        if (err) {
            return res.status(400).json({
                error: "Link Expired."
            })
        }

        const { hospitalEmail } = decoded;

        Hospital.findOne({ email: hospitalEmail }).exec((err, hosp) => {

            if (err || hosp) {
                return res.status(400).json({
                    error: "Hospital already registered."
                })
            }

            return res.json({
                valid: true,
                email: decoded.email,
                hospitalEmail: decoded.hospitalEmail,
                message: "Hospital token still valid"
            })
        })
    })
}

// POST api/hospital/register/activate
exports.activateHospitalRegister = (req, res) => {
    const { token, data } = req.body;

    // console.log(token, data);

    jwt.verify(token, process.env.JWT_HOSPITAL_ACCOUNT_ACTIVATION, (err, decoded) => {
        if (err) {
            return res.status(400).json({
                error: "Link Expired. Please issue a new link."
            })
        }

        const { email, hospitalEmail } = decoded;

        Hospital.findOne({ email: hospitalEmail }).exec((err, existing) => {
            if (err || existing) {
                return res.status(400).json({
                    error: "Hospital already exists on the platform, please sign in."
                })
            }

            User.findOne({ email }).exec((err, user) => {
                if (err || !user) {
                    return res.status(400).json({
                        error: "No user exists with that email. Please make sure an account with email exists on the platform."
                    })
                }

                const hospital = new Hospital({
                    name: data.name,
                    location: {
                        coordinates: {
                            latitude: data.lat,
                            longitude: data.lng,
                        },
                        district: data.district,
                        country: data.country,
                        region: data.region,
                        place: data.place,
                        text: data.text,
                        pincode: data.pincode,
                    },
                    admins: [
                        user._id
                    ],
                    contact: {
                        phone: data.phone,
                        email: data.hospitalEmail,
                    },
                    email: data.hospitalEmail,
                    password: data.password
                });


                hospital.save((err, saved) => {
                    if (err) {
                        // console.log(err);
                        return res.status(400).json({
                            error: "Hospital could not be saved. Please try again."
                        })
                    }

                    const newType = new Type({
                        name: saved.name,
                        otherId: saved._id
                    })

                    newType.save((err, type) => {
                        if (err) {
                            // console.log("new type err: ", err)
                            return res.status(400).json({
                                error: "Server error."
                            })
                        }

                        const newRole = new Role({
                            name: "admin",
                            type: {
                                name: type.name,
                                typeId: type.otherId
                            }
                        });

                        newRole.save((err, role) => {

                            if (err) {
                                // console.log("new role err: ", err)
                                return res.status(400).json({
                                    error: "Server error."
                                })
                            }

                            const newAccRoles = [...user.accountRoles, role];

                            // console.log(newAccRoles);

                            user.accountRoles = [...newAccRoles];

                            user.save((err, _) => {

                                if (err) {
                                    // console.log("new user err: ", err)
                                    return res.status(400).json({
                                        error: "Server error."
                                    })
                                }
                                const hospitalToken = jwt.sign({ _id: saved._id, email: saved.email }, process.env.JWT_HOSPITAL_SECRET, {
                                    expiresIn: '28d'
                                });

                                // console.log(_);

                                res.cookie('hospital_register', "asdasd", {
                                    maxAge: 0,
                                    httpOnly: true,
                                    signed: true
                                })

                                res.cookie('hospital', hospitalToken, {
                                    maxAge: 1000 * 60 * 60 * 24 * 28,
                                    httpOnly: true,
                                    signed: true
                                })
                                return res.json({
                                    message: "Hospital successfully created.",
                                    hospital: saved,
                                    success: true
                                });
                            })
                        })
                    })
                })
            })
        })
    })
}

//POST /api/hospital/signin
exports.hospitalSignin_POST = async (req, res) => {
    const { email, password } = req.body;

    Hospital.findOne({ email }).exec((err, hosp) => {
        if (err || !hosp) {
            return res.status(400).json({
                error: "Invalid email or password",
                secretError: "User not found"
            })
        }

        if (!hosp.authenticate(password)) {
            return res.status(400).json({
                error: "Invalid email or password"
            });
        }

        const { _id, name, admins, contact } = hosp;

        const token = jwt.sign({ _id: hosp._id, email }, process.env.JWT_HOSPITAL_SECRET, {
            expiresIn: '28d'
        });

        res.cookie('hospital', token, {
            maxAge: 1000 * 60 * 60 * 24 * 28,
            httpOnly: true,
            signed: true
        })

        return res.status(200).json({
            token,
            hospital: {
                _id,
                name,
                admins,
                contact,
                employees: hosp.employeeCount,
                staffs: hosp.staffCount,
                admins: hosp.adminCount,
                patients: hosp.patientCount
            },
            message: `signed in successfully.`
        })
    })
}

//POST /api/hospital/resignin
exports.reSigninHospital_POST = (req, res) => {
    const { hospital } = req.signedCookies;

    if (!hospital) {
        return res.status(400).json({
            error: "Not signed in."
        })
    }

    jwt.verify(hospital, process.env.JWT_HOSPITAL_SECRET, (err, decoded) => {
        if (err) {
            return res.status(400).json({
                error: "Not authorized."
            })
        }

        const { email, _id } = decoded;

        Hospital.findById(_id).exec((err, hosp) => {
            if (err || !hosp) {
                return res.status(400).json({
                    error: "Hospital not found."
                })
            }

            const { _id, name, admins, contact, roles, departments } = hosp;

            const token = jwt.sign({ _id: hosp._id, email }, process.env.JWT_HOSPITAL_SECRET, {
                expiresIn: '28d'
            });

            res.cookie('hospital', token, {
                maxAge: 1000 * 60 * 60 * 24 * 28,
                httpOnly: true,
                signed: true
            })

            return res.json({
                message: "Resigned in successfully.",
                hospital: {
                    _id,
                    name,
                    admins,
                    contact,
                    employees: hosp.employeeCount,
                    staffs: hosp.staffCount,
                    admins: hosp.adminCount,
                    patients: hosp.patientCount,
                    roles,
                    departments
                },
                token
            })
        })
    })
}

//POST /api/hospital/detail
exports.hospitalDetail_POST = (req, res) => {
    const hospitalId = req.hospitalId;

    Hospital.findOne({ _id: hospitalId }).exec((err, hosp) => {
        if (err || !hosp) {
            return res.status(404).json({
                error: "Hospital not found."
            })
        }
        const { _id, name, admins, contact, roles, departments } = hosp;
        return res.json({
            hospital: {
                _id,
                name,
                admins,
                contact,
                employees: hosp.employeeCount,
                staffs: hosp.staffCount,
                admins: hosp.adminCount,
                patients: hosp.patientCount,
                roles,
                departments
            },
        })
    })
}

//GET /api/hospital/role/all
exports.hospitalAllRole_GET = async (req, res) => {
    const hospitalId = req.hospitalId;

    const hospitalRoles = await HospitalRole.find({hospitalId}).catch(_ => {
        return res.status(400).json({
            error: "Error finding Roles."
        })
    });

    if(!hospitalRoles) {
        return res.json({
            roles: []
        })
    }

    return res.json({
        roles: hospitalRoles
    })
}

//GET /api/hospital/department/all
exports.hospitalAllDepartment_GET = async (req, res) => {
    const hospitalId = req.hospitalId;

    const hospitalDeps = await HospitalDep.find({hospitalId}).catch(_ => {
        return res.status(400).json({
            error: "Error finding Departments."
        })
    });

    if(!hospitalDeps) {
        return res.json({
            departments: []
        })
    }

    return res.json({
        departments: hospitalDeps
    })
}

//POST /api/hospital/role/create
exports.hospitalCreateRole_POST = async (req, res) => {
    const hospitalId = req.hospitalId;
    const {name} = req.body;

    if(!name.length >= 1) {
        return res.status(400).json({
            error: "Required params not provided"
        })
    }

    const roleExist = await HospitalRole.findOne({$and: [{name},{hospitalId}]}).catch(_ => {
        return res.status(400).json({
            error: "Error finding role"
        })
    });

    if(roleExist) {
        return res.status(400).json({
            error: "Role already exist with the given name"
        })
    }

    const newRole = new HospitalRole({
        name,
        hospitalId
    });

    const hospital = await Hospital.findById(hospitalId).catch(_ => {
        return res.status(400).json({
            error: "Error finding hospital."
        })
    })

    if(!hospital) {
        return res.status(404).json({
            error: "Hospital not found."
        })
    }

    const savedRole = await newRole.save().catch(_ => {
        return res.status(400).json({
            error: "Error saving new role."
        })
    })

    const newRoleList = [...hospital.roles, savedRole._id];
    hospital.roles = [...newRoleList];
    try {
        await hospital.save();
        const roles = await HospitalRole.find({hospitalId});
        return res.status(201).json({
            message: "Role created successfully",
            created: savedRole,
            roles
        })
    } catch(error) {
        return res.status(400).json({
            error: "Couldn't created role."
        })
    }

    
}

//POST /api/hospital/role/create
exports.hospitalCreateDepartment_POST = async (req, res) => {
    const hospitalId = req.hospitalId;
    const {name} = req.body;

    if(!name.length >= 1) {
        return res.status(400).json({
            error: "Required params not provided"
        })
    }

    const depExist = await HospitalDep.findOne({$and: [{name},{hospitalId}]}).catch(_ => {
        return res.status(400).json({
            error: "Error finding role"
        })
    });

    if(depExist) {
        return res.status(400).json({
            error: "Department already exist with the given name."
        })
    }

    const newDep = new HospitalDep({
        name,
        hospitalId
    });

    const hospital = await Hospital.findById(hospitalId).catch(_ => {
        return res.status(400).json({
            error: "Error finding hospital."
        })
    })

    if(!hospital) {
        return res.status(404).json({
            error: "Hospital not found."
        })
    }

    const savedDep = await newDep.save().catch(_ => {
        return res.status(400).json({
            error: "Error saving new department."
        })
    })

    const newDepartmentList = [...hospital.departments, savedDep._id];
    hospital.departments = [...newDepartmentList];

    try {
        await hospital.save();
        const deps = await HospitalDep.find({hospitalId});
        return res.status(201).json({
            message: "Department created successfully",
            created: savedDep,
            departments: deps
        })
    } catch(error) {
        return res.status(400).json({
            error: "Couldn't create department."
        })
    }
}

//DELETE /api/hospital/role/delete
exports.deleteRoleHospital_DELETE = async (req, res) => {
    const hospitalId = req.hospitalId;
    const {_id} = req.body;

    const deletedRole = await HospitalRole.findByIdAndDelete(_id).catch(_ => {
        return res.status(400).json({
            error: "Could not delete role."
        })
    });

    const hospital = await Hospital.findById(hospitalId).catch(_ => {
        return res.status(400).json({
            error: "Error finding hospital"
        })
    })

    if(!hospital) {
        return res.status(404).json({
            error: "Hospital not found."
        })
    }

    const newRoleList = hospital.roles.filter(item => !item.equals(_id));
    hospital.roles = [...newRoleList];

    try {
        await hospital.save();
        const roles = await HospitalRole.find({hospitalId});
        return res.status(201).json({
            message: "Role deleted successfully",
            deletedRole,
            isRole: true,
            roles
        })
    } catch(error) {
        return res.status(400).json({
            error: "Couldn't delete role."
        })
    }
}

//DELETE /api/hospital/department/delete
exports.deleteDepartmentHospital_DELETE = async (req, res) => {
    const hospitalId = req.hospitalId;
    const {_id} = req.body;

    const deletedDep = await HospitalDep.findByIdAndDelete(_id).catch(_ => {
        return res.status(400).json({
            error: "Could not delete department."
        })
    });

    const hospital = await Hospital.findById(hospitalId).catch(_ => {
        return res.status(400).json({
            error: "Error finding hospital"
        })
    })

    if(!hospital) {
        return res.status(404).json({
            error: "Hospital not found."
        })
    }

    const newDepList = hospital.departments.filter(item => !item.equals(_id));
    hospital.departments = [...newDepList];

    try {
        await hospital.save();
        const departments = await HospitalDep.find({hospitalId});
        return res.status(201).json({
            message: "Department deleted successfully",
            deletedDep,
            isDep: true,
            departments
        })
    } catch(error) {
        console.log(error);
        return res.status(400).json({
            error: "Couldn't delete role."
        })
    }
}




