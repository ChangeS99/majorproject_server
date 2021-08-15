const mongoose = require('mongoose');
const fuzzy = require('mongoose-fuzzy-searching');

// other models
const Hospital = require('./hospital');

const employeeSchema = new mongoose.Schema({
    username: {
        type: String,
        min: 5,
        max: 30,
        trim: true,
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
    email: {
        type: String,
        required: true,
        max: 50,
    },
    role: {
        type: String
    },
    type: {
        type: String
    },
    department: {
        type: String
    },
    joined: {
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
    left: {
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
    timing: {
        arrival: {
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
                max: 59
            }
        },
        leaving: {
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
                max: 59
            }
        }
    },
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId
    }
}, {
    timestamps: true
});

employeeSchema.virtual("fullname")
    .get(function () {
        if (this.middleName) {
            return `${this.firstName} ${this.lastName}`;
        } else {
            return `${this.firstName} ${this.middleName} ${this.lastName}`;
        }
    })

employeeSchema.methods = {
    setRole: function (hospitalId, roleName, typeName) {
        Hospital.findOne({ _id: hospitalId }).exec((err, hospital) => {
            if (err || !hospital) {
                return new Error("Hospital not found.");
            }

            const roleExist = hospital.roles.find(item => item.name === roleName);
            const typeExist = hospital.roles.find(item => item.name === typeName);

            if (!roleExist || !typeExist) {
                return new Error("Could not set role for the staff. Please try again.");
            }

            this.role = roleName;
            this.type = typeName;

        })
    }
}

employeeSchema.plugin(fuzzy, {
    fields: [
        'firstName',
        'middleName',
        'lastName'
    ]
})

const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;