const mongoose = require('mongoose');

const stageSchema = new mongoose.Schema({
    detail: {
        type: String,
        required: true
    },
    diagnosis: {
        type: String
    },
    room: {
        name: {
            type: String
        },
        number: {
            type: Number
        }
    },
    floor: {
        type: String
    },
    under: {
        type: mongoose.Schema.Types.ObjectId
    },
    started: {
        type: Date
    },
    finished: {
        type: Date
    },
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId
    }
},
    {
        timeStamps: true
    })

const Stage = mongoose.model("Stage", stageSchema);

module.exports = Stage;