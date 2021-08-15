const {
    userSignupSchema,
    userSigninSchema
} = require('./ValidationSchemas/authRelated');

const {
    adminSigninSchema,
    adminSignupSchema
} = require('./ValidationSchemas/adminRelated');

const {
    hospitalRegisterSchema,
    hospitalDetailSchema
} = require('./ValidationSchemas/hospitalRelated');

// User related
exports.userSignupValidator = (req, res, next) => {
    const result = userSignupSchema.validate(req.body);

    if(result.error) {
        return res.status(400).json({
            error: result.error.details[0].message
        })
    }

    next();
}

exports.userSigninValidator = (req, res, next) => {
    const result = userSigninSchema.validate(req.body);

    if(result.error) {
        return res.status(400).json({
            error: result.error.details[0].message
        })
    }

    next();
}

//admin related
exports.adminSignupValidator = (req, res, next) => {
    const result = adminSignupSchema.validate(req.body);

    if(result.error) {
        return res.status(400).json({
            error: result.error.details[0].message
        })
    }

    next();
}

exports.adminSigninValidator = (req, res, next) => {
    const result = adminSigninSchema.validate(req.body);

    if(result.error) {
        return res.status(400).json({
            error: result.error.details[0].message
        })
    }

    next();
}

exports.hospitalRegisterValidator = (req, res, next) => {
    const result = hospitalRegisterSchema.validate(req.body);

    if(result.error) {
        return res.status(400).json({
            error: result.error.details[0].message
        })
    }

    next();
}

exports.hospitalDetailValidator = (req, res, next) => {
    const result = hospitalDetailSchema.validate(req.body.data);

    if(result.error) {
        return res.status(400).json({
            error: result.error.details[0].message
        })
    }

    next();
}

