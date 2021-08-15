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
            // required: true
        },
        region: {
            type: String,
            min: 1,
            max: 50,
            // required: true
        },
        place: {
            type: String,
            min: 1,
            max: 100,
            // required: true
        },
        district: {
            type: String,
            min: 1,
            max: 50,
            // required: true
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

    department: [
        {
            type: String
        }
    ],
    admitted: {
        date: {
            day: {
                type: Number,
                min: 1,
                max: 31
            },
            month: {
                type: Number,
                min: 1,
                max: 12
            },
            year: {
                type: Number,
                min: 1950,
                max: 4000
            }
        },
        time: {
            hour: {
                type: Number,
                min: 0,
                max: 23
            },
            minute: {
                type: Number,
                min: 0,
                max: 59,
            },
            second: {
                type: Number,
                min: 0,
                max: 59,
                default: 0
            }
        }  
    },
    discharged: {
        date: {
            day: {
                type: Number,
                min: 1,
                max: 31
            },
            month: {
                type: Number,
                min: 1,
                max: 12
            },
            year: {
                type: Number,
                min: 1950,
                max: 4000
            }
        },
        time: {
            hour: {
                type: Number,
                min: 0,
                max: 23
            },
            minute: {
                type: Number,
                min: 0,
                max: 59,
            },
            second: {
                type: Number,
                min: 0,
                default: 0,
                max: 59
            }
        }    
    },
    email: {
        type: String,
        max: 100
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