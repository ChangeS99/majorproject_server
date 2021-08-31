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
    roles: [{
        type: String
    }],
    type: {
        type: String
    },
    departments: [{
        type: String
    }],
    dob: {
        type: Date
    },
    joined: {
        type: Date
    },
    left: {
        type: Date
    },
    timing: {
        arrival: {
            type: String,
        },
        leaving: {
            type: String
        }
    },
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId
    },
    contact: {
        phone: {
            type: String
        },
        email: {
            type: String
        }
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