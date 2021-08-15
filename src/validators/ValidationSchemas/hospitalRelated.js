const Joi = require('joi');

exports.hospitalRegisterSchema = Joi.object({
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
    hospitalEmail: Joi.string()
        .email()
        .required()
});

exports.hospitalDetailSchema = Joi.object({
    name: Joi.string()
        .max(100)
        .min(5)
        .required(),
    country: Joi.string()
        .max(50)
        .min(1)
        .required(),
    region: Joi.string()
        .max(50)
        .min(1)
        .required(),
    district: Joi.string()
        .max(50)
        .min(1)
        .required(),
    place: Joi.string()
        .max(256)
        .min(1)
        .required(),
    pincode: Joi.string()
        .min(6)
        .max(6)
        .pattern(new RegExp('^[0-9]{1,10}$'))
        .required(),
    text: Joi.string()
        .required()
        .trim()
        .min(1)
        .max(100),
    phone: Joi.string()
        .min(10)
        .max(10)
        .pattern(new RegExp('^[0-9]{1,10}$'))
        .required(),
    lat: Joi.string()
        .required()
        .pattern(new RegExp('[+-]?([0-9]*[.])?[0-9]+')),
    lng: Joi.string()
        .required()
        .pattern(new RegExp('[+-]?([0-9]*[.])?[0-9]+')),
    hospitalEmail: Joi.string()
        .max(50)
        .min(1)
        .email({ tlds: { allow: false } })
        .required(),
    password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
});