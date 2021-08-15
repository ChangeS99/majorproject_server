const Joi = require('joi');

exports.adminSignupSchema = Joi.object({
    username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),
    email: Joi.string()
        .trim()
        .email()
        .required()
        .custom((value, helper) => {
            if (!value.endsWith('@gmail.com')) {
                return helper.message("email must be valid email")

            } else {
                return true
            }
        }),
    password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
});

exports.adminSigninSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .custom((value, helper) => {
            if (!value.endsWith('@gmail.com')) {
                return helper.message("please entera a valid email")

            } else {
                return true
            }
        }),
    password: Joi.string()
        .min(3)
        .max(30)
        .required()
        .custom((value, helper) => {
            if (value.trim().length < 3) {
                return helper.message("please enter a valid password");
            }
        })
});

