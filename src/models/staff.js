const mongoose = require('mongoose');
const fuzzy = require('mongoose-fuzzy-searching');

// other models
const Hospital = require('./hospital');

const staffSchema = new mongoose.Schema({
    username: {
        type: String,
        min: 5,
        max: 30,
        trim: true
    },
    name: {
        firstName: {
            type: String,
            required: true,
            min: 1,
            max: 30,
            trim: true
        },
        middleName: {
            type: String,
            required: true,
            min: 1,
            max: 30,
            trim: true
        },
        LastName: {
            type: String,
            required: true,
            min: 1,
            max: 30,
            trim: true
        },
    },
    role: {
        type: String
    },
    type: {
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

staffSchema.virtual("fullname")
.get(function() {
    if(this.name.middleName) {
        return `${this.name.firstName} ${this.name.lastName}`;
    } else {
        return `${this.name.firstName} ${this.name.middleName} ${this.name.lastName}`;
    }
})

staffSchema.methods = {
    setRole: function(hospitalName, roleName, typeName) {
        Hospital.findOne({name: hospitalName}).exec((err, hospital) => {
            if(err || !hospital) {
                return new Error("Hospital not found.");
            }

            const roleExist = hospital.roles.find(item =>  item.name === roleName);
            const typeExist = hospital.roles.find(item => item.name === typeName);
            
            if(roleExist && typeExist) {
                this.role = roleName;
                this.type = typeName;
            }

            return new Error("Could not set role for the staff. Please try again.");
        })
    }
}

staffSchema.plugin(fuzzy, {
    fields: [
        {
            name: 'name',
            keys: [
                'firstName',
                'middleName',
                'lastName'
            ]
        }
    ]
})

const Staff = mongoose.model("Staff", staffSchema);

module.exports = Staff;