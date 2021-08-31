const mongoose = require('mongoose');
const fuzzy = require('mongoose-fuzzy-searching');


// other models
// const Hospital = require('./hospital');

const patientSchema = new mongoose.Schema({
    address: {
        coordinates: {
            latitude: {
                type: String,
                min: 1,
                max: 50,
                default: "",
            },
            longitude: {
                type: String,
                min: 1,
                max: 50,
                default: "",
            },
        },
        country: {
            type: String,
            min: 1,
            max: 50,
            default: "",
            // required: true
        },
        region: {
            type: String,
            min: 1,
            max: 50,
            default: "",
            // required: true
        },
        place: {
            type: String,
            min: 1,
            max: 100,
            default: "",
            // required: true
        },
        district: {
            type: String,
            min: 1,
            max: 50,
            default: "",
            // required: true
        },
        pincode: {
            type: String,
            min: 6,
            max: 6,
            default: "",
        },
        text: {
            type: String,
            min: 1,
            max: 100,
            default: "",
        },
    },
    firstName: {
        type: String,
        required: true,
        min: 1,
        max: 30,
        trim: true
    },
    middleName: {
        type: String,
        min: 1,
        max: 30,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        min: 1,
        max: 30,
        trim: true
    },
    departments: [
        {
            type: String
        }
    ],
    dob: {
        type: Date
    },
    admitted: {
        type: Date
    },
    discharged: {
        type: Date
    },
    stages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Stage"
        }
    ],
    email: {
        type: String,
        max: 100
    },
    contact: {
        phone: {
            type: String
        },
        email: {
            type: String
        }
    },
    diagnosis: {
        text: {
            type: String,
            max: 200
        }
    },
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId
    }
}, {
    timestamps: true
});

patientSchema.virtual("fullname")
    .get(function () {
        if (this.name.middleName) {
            return `${this.firstName} ${this.lastName}`;
        } else {
            return `${this.firstName} ${this.middleName} ${this.lastName}`;
        }
    });


patientSchema.plugin(fuzzy, {
    fields: [
        'firstName',
        'middleName',
        'lastName'
    ]
})

const Patient = mongoose.model("Patient", patientSchema);

module.exports = Patient;