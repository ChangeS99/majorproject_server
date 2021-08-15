const mongoose = require('mongoose');
const fuzzy = require('mongoose-fuzzy-searching');

const hospitalRoleSchema = new mongoose.Schema({
    name: {
        type: String,
        min: 1,
        max: 100,
    },
    isRole: {
        type: Boolean,
        default: true,
    },
    about: {
        type: String,
        max: 100,
    },
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId
    },
    people: [{
        type: mongoose.Schema.Types.ObjectId
    }]
});

hospitalRoleSchema.methods = {
    insertPeople: function (_id) {
        const newPeople = [...this.people, _id];
        this.people = [...newPeople];
        this.save();
    }
}

hospitalRoleSchema.plugin(fuzzy, {
    fields: ["title"]
});

const HospitalRole = mongoose.model("HospitalRole", hospitalRoleSchema);

module.exports = HospitalRole;