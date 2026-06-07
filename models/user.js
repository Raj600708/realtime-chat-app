const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },

    lastSeen: {
    type: Date,
    default: null,
    },
});

module.exports = mongoose.model("User", userSchema);
