const mongoose = require('mongoose');

// for role relating to hospital 
// typeId will store the hospital id instead of document id of type.
const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        min: 4,
        max: 30
    },
    type: {
        name: {
            type: String,
            min: 4,
            max: 50,
        },
        typeId: mongoose.Schema.Types.ObjectId
    },
    properties: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

roleSchema.virtual('title').get(function(){
    return this.name;
})

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;