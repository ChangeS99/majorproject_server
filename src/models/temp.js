const mongoose = require('mongoose');

function endsWithEmail(suffixes, string) {
    return suffixes.some(function (suffix) {
        return string.endsWith(suffix);
    });
}

const tempSchema = new mongoose.Schema({
    email: {
        type: String,
        validate: {
            validator:function (value) {
                return endsWithEmail(["@gmail.com", "@outlook.com"], value)
            },
            message: props => `${props.value} is not a valid email!`
        },
        required: [true, 'email is required'],
    },
    forHospitalAdmin: {
        type: Boolean,
        default: false
    },
    expire_at: { type: Date, default: Date.now, expires: 669 }
});

const Temp = mongoose.model("Temp", tempSchema);

module.exports = Temp;

