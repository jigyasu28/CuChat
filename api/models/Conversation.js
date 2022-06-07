const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
    {
        members:{
            type: Array,
        },
        admins:{
            type: Array,
        },
        isGroup:{
            type: Boolean,
            default: false,
        },
        name:{
            type: String,
            default: ''
        },
        unseenMessageCount:{
            type: Number,
            default: 0,
        },
        sender:{
            type: String
        }

}, {timestamps:true}
);

module.exports = mongoose.model("Conversation", ConversationSchema);