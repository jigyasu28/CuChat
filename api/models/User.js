const mongoose = require("mongoose");
const { stringify } = require("nodemon/lib/utils");


const UserSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        min: 3,
        max: 20,
        unique: true
    },
    email:{
        type: String,
        required: true,
        max: 50,
        unique: true
    },
    uid:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true,
        min: 6
    },
    profilePicture:{
        type: String,
        default: "default.jpg"
    },
    coverPicture:{
        type: String,
        default: "default.jpg"
    },
    friends:{
        type: Array,
        default: []
    },
    requestsReceived:{
        type: Array,
        default: []
    },
    requestsSent:{
        type: Array,
        default: []
    },
    isAdmin:{
        type:Boolean,
        default: false,
    },
    blocked:{
        type: Array,
        default: [],
    },
    desc:{
        type: String,
        max: 50
    },
}, {timestamps:true}
);

module.exports = mongoose.model("User", UserSchema);