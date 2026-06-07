// const mongoose = require("mongoose");

// const chatSchema = new mongoose.Schema ({
//     from : {
//         type : String,
//         required : true,
//     },
//     to : {
//         type : String,
//         required : true,
//     },
//     msg : {
//         type : String,
//         maxlength : 100,
//     },
//     created_at : {
//         type : Date,
//         required : true,
//     },
// });

// const Chat = mongoose.model("Chat", chatSchema);

// module.exports = Chat;


// new code for new  projects.......


const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema ({
    from : {
        type : String,
        required : true,
    },
    to : {
        type : String,
        required : true,
    },
    msg : {
        type : String,
        required : true,
        trim : true,
        maxlength : 500,
    },
    created_at : {
    type : Date,
    default : Date.now,
    },

    messageType : {
    type : String,
    enum : ["text", "image"],
    default : "text",
    },

    replyTo: {
    type: String,
    default: null,
    },

    isRead : {
        type : Boolean,
        default : false,
    },
});

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;