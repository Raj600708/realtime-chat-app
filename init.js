// const mongoose = require("mongoose");
// const Chat = require("./models/chat.js");

// main()
// .then(() => {
//     console.log("Connection successful!");
// })
// .catch(err => console.log(err));

// async function main() {
//     await mongoose.connect('mongodb://127.0.0.1:27017/whatsapp');
// }

// let allChats = [
//     {
//         from : "neha",
//         to : "priya",
//         msg : "send me your exam sheets",
//         created_at : new Date(),
//     },
//     {
//         from : "priti",
//         to : "suraj",
//         msg : "send me your exam roll number",
//         created_at : new Date(),
//     },
//     {
//         from : "raj",
//         to : "anshu",
//         msg : "send me your upi number",
//         created_at : new Date(),
//     },
//     {
//         from : "pandit",
//         to : "god",
//         msg : "send me your Vadik Mantra",
//         created_at : new Date(),
//     },
//     {
//         from : "srashti",
//         to : "sharma",
//         msg : "send me your cute picture",
//         created_at : new Date(),
//     }
// ];


// Chat.insertMany(allChats);


// new code for new  projects........


const mongoose = require("mongoose");
const Chat = require("./models/chat.js");

main()
.then(() => {
    console.log("Connection successful!");
})
.catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/whatsapp');
}

let allChats = [
    {
        from : "neha",
        to : "priya",
        msg : "send me your exam sheets",
        created_at : new Date(),
    },
    {
        from : "priti",
        to : "suraj",
        msg : "send me your exam roll number",
        created_at : new Date(),
    },
    {
        from : "raj",
        to : "anshu",
        msg : "send me your upi number",
        created_at : new Date(),
    },
    {
        from : "pandit",
        to : "god",
        msg : "send me your Vadik Mantra",
        created_at : new Date(),
    },
    {
        from : "srashti",
        to : "sharma",
        msg : "send me your cute picture",
        created_at : new Date(),
    }
];


Chat.insertMany(allChats);




