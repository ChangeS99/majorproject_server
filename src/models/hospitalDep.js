const mongoose = require('mongoose');
const fuzzy = require('mongoose-fuzzy-searching');

const hospitalDepSchema = new mongoose.Schema({
    name: {
        type: String,
        min: 1,
        max: 50,
    },
    about: {
        type: String,
        max: 100,
    },
    isDepartment: {
        type: Boolean,
        default: true
    },
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId
    },
    people: [{
        type: mongoose.Schema.Types.ObjectId
    }]
});

hospitalDepSchema.methods = {
    insertPeople: function (_id) {
        const newPeople = [...this.people, _id];
        this.people = [...newPeople];
        this.save();
    }
}

hospitalDepSchema.plugin(fuzzy, {
    fields: ["title"]
});

const HospitalDep = mongoose.model("HospitalDep", hospitalDepSchema);

module.exports = HospitalDep;