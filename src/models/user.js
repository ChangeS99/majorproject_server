const mongoose = require('mongoose');
const crypto = require('crypto');
const mongoosePaginate = require('mongoose-paginate-v2');
const fuzzy = require("mongoose-fuzzy-searching");
// other models
const Role = require('./role');
const Type = require('./type');

const ObjectId = mongoose.Schema.Types.ObjectId;

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            trim: true,
            max: 30
        },
        middleName: {
            type: String,
            trim: true,
            max: 30
        },
        lastName: {
            type: String,
            trim: true,
            max: 30
        },
        username: {
            type: String,
            trim: true,
            unique: true,
            required: true,
            max: 30
        },
        email: {
            type: String,
            trim: true,
            required: true,
            unique: true,
            lowercase: true
        },
        hashed_password: {
            type: String,
            required: true
        },
        salt: String,
        accountRoles: [
            {
                type: mongoose.Schema.Types.Mixed
            }
        ],
        resetPasswordLink: {
            data: String,
            default: ''
        }
    },
    { timestamps: true }
);


userSchema
    .virtual('password')
    .set(function (password) {
        // create a temporarity variable called _password
        this._password = password;
        // generate salt
        this.salt = this.makeSalt();
        // encryptPassword
        this.hashed_password = this.encryptPassword(password);
    })
    .get(function () {
        return this._password;
    });

userSchema.methods = {
    authenticate: function (plainText) {
        return this.encryptPassword(plainText) === this.hashed_password;
    },

    encryptPassword: function (password) {
        if (!password) return '';
        try {
            return crypto
                .createHmac('sha256', this.salt)
                .update(password)
                .digest('hex');
        } catch (err) {
            return '';
        }
    },

    makeSalt: function () {
        return crypto.randomBytes(Math.ceil(16 / 2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0, 16);   /** return required number of characters */
    },
    setRole: async function (name = '', type = '') {
        try {
            const role = await Role.findOne({ name, "type.name": type });

            if (!role) {
                return new Error("could not find the given role");
            }

            const alreadyExists = this.accountRoles.find(item => item.name === name);


            if (alreadyExists) {
                return new Error("Role already exists on the user");
            }

            const newRoles = [...this.accountRoles, {
                ...role
            }];

            this.accountRoles = newRoles;
        } catch (err) {
            return new Error("Failed to create role for the user");
        }
    },
    checkRole: function (name) {
        return this.roles.find(roles => roles.name === name);
    }
};

userSchema.plugin(mongoosePaginate);
userSchema.plugin(fuzzy, {
    fields: [
        'username',
        'firstName',
        'middleName',
        'lastName'
    ]
})

userSchema.query.byHospitalId = function (id) {
    return this.where({ "accountRoles.type.typeId": id });
};

const User = mongoose.model('User', userSchema);

module.exports = User;