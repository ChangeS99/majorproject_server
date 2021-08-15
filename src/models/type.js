const mongoose = require('mongoose');

const typeSchema = new mongoose.Schema({
    name: {
        type: String,
        min: 4,
        max: 50,
        unique: true
    },
    otherId: {
        type: mongoose.Schema.Types.ObjectId
    },
    properties: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

typeSchema.virtual('title').get(function(){
    return this.name;
});

// typeSchema.virtual('hospitalId')
// .set(function(id) {
//     this.properties = {
//         ...this.properties,
//         hospitalId: id
//     }
// })
// .get(function(){
//     return this.properties.hospitalId;
// })

const Type = mongoose.model('Type', typeSchema);

module.exports = Type;