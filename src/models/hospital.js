const mongoose = require('mongoose');
const crypto = require('crypto');
const fuzzy = require('mongoose-fuzzy-searching');

const hospitalSchema = new mongoose.Schema({
    name: {
        type: String,
        min: 5,
        max: 50,
        required: true,
    },
    location: {
        coordinates: {
            latitude: {
                type: String,
                min: 1,
                max: 50,
                unique: true
            },
            longitude: {
                type: String,
                min: 1,
                max: 50,
                unique: true
            },
        },
        country: {
            type: String,
            min: 1,
            max: 50,
            required: true
        },
        region: {
            type: String,
            min: 1,
            max: 50,
            required: true
        },
        place: {
            type: String,
            min: 1,
            max: 100,
            required: true
        },
        district: {
            type: String,
            min: 1,
            max: 50,
            required: true
        },
        pincode: {
            type: String,
            min: 6,
            max: 6
        },
        text: {
            type: String,
            min: 1,
            max: 100
        },
    },
    roles: [{
        type: mongoose.Schema.Types.ObjectId
    }],
    departments: [{
        type: mongoose.Schema.Types.ObjectId
    }],
    types: [
        {
            name: {
                type: String,
                min: 1,
                max: 100,
                unique: true
            }
        }
    ],
    events: [
        {
            type: mongoose.Schema.Types.ObjectId
        }
    ],
    staffs: [
        {
            type: mongoose.Schema.Types.ObjectId
        }
    ],
    employees: [
        {
            type: mongoose.Schema.Types.ObjectId
        }
    ],
    admins: [
        {
            type: mongoose.Schema.Types.ObjectId
        }
    ],
    patients: [
        {
            type: mongoose.Schema.Types.ObjectId
        }
    ],
    room: [
        {
            number: {
                type: Number,
                min: 1,
                max: 5000
            },
            detail: {
                type: String,
                min: 3,
                max: 50
            }
        }
    ],
    floor: [
        {
            number: {
                type: Number,
                min: 1,
                max: 500
            },
            detail: {
                type: String,
                min: 3,
                max: 50
            }
        }
    ],
    announcements: [{
        type: mongoose.Schema.Types.ObjectId
    }],
    contact: {
        phone: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        }
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
}, {
    timestamps: true
});

hospitalSchema
    .virtual('employeeCount')
    .get(function () {
        return this.employees.length;
    });

hospitalSchema
    .virtual('patientCount')
    .get(function () {
        return this.patients.length;
    });

hospitalSchema
    .virtual('staffCount')
    .get(function () {
        return this.staffs.length;
    });

hospitalSchema
    .virtual('adminCount')
    .get(function () {
        return this.admins.length;
    });

hospitalSchema
    .virtual('patientCount')
    .get(function () {
        return this.patients.length;
    });

hospitalSchema
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

hospitalSchema.methods = {
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
}

hospitalSchema.plugin(fuzzy, {
    fields: [
        'name'
    ]
})

const Hospital = mongoose.model("Hospital", hospitalSchema);

module.exports = Hospital;