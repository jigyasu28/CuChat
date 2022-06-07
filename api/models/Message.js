const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
    {
        conversationId:{
            type: String
        },
        sender:{
            type: String
        },
        text:{
            type: String
        },
        createdAt:{
            type: Number,
            default: Date.now()
        }

    }, {timestamps:true}
);

module.exports = mongoose.model("Message", MessageSchema);