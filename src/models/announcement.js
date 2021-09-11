const mongoose = require('mongoose');
const fuzzy = require('mongoose-fuzzy-searching');

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        max: 30,
        min: 1,
        required: true,
        unique: true
    },
    field: {
        type: String,
        max: 50,
        min: 1,
        required: true,
        default: "global"
    },
    detail: {
        type: String,
        min: 1,
        max: 100
    },
    recipients: {
        emails: [{
            type: String
        }],
        phones: [{
            type: String
        }]
    },
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId
    }
}, {
    timestamps: true
});

announcementSchema.plugin(fuzzy, {
    fields: ["title"]
});

const Announcement = mongoose.model("Announcement", announcementSchema);

module.exports = Announcement;