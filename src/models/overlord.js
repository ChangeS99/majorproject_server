const mongoose = require('mongoose');
const crypto = require('crypto');

const ObjectId = mongoose.Schema.Types.ObjectId;

const overlordSchema = new mongoose.Schema(
    {   
        name: {
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
            }
        },
        username: {
            type: String,
            trim: true,
            required: true,
            unique: true,
            max: 40
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
        resetPasswordLink: {
            data: String,
            default: ''
        }
    },
    { timestamps: true }
);

overlordSchema
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

overlordSchema.methods = {
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
};

const Overlord = mongoose.model('Overlord', overlordSchema);

module.exports = Overlord;