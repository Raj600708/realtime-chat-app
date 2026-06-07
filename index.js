// const express = require("express");
// const app = express();
// const mongoose = require("mongoose");
// const path = require("path");
// const Chat = require("./models/chat.js");
// const methodOverride = require("method-override");

// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "ejs");
// app.use(express.static(path.join(__dirname, "public")));
// app.use(express.urlencoded({extended : true}));
// app.use(methodOverride("_method"));

// main()
// .then(() => {
//     console.log("Connection successful!");
// })
// .catch(err => console.log(err));

// async function main() {
//     await mongoose.connect('mongodb://127.0.0.1:27017/whatsapp');
// }

// //Index Route

// app.get("/Chats", async (req, res) => {
//     let Chats = await Chat.find();
//     //console.log(Chats);
//     res.render("index.ejs", {Chats});

// });



// //New Route
// app.get("/Chats/new", (req, res) => {
//     res.render("new.ejs");
// });


// //Create Route
// app.post("/Chats", (req, res) => {
//     let {from, to, msg} = req.body;
//     let newChat = new Chat ({
//         from: from,
//         to: to,
//         msg: msg,
//         created_at: new Date()
//     });
//     newChat
//     .save()
//     .then((res) => {
//         console.log("Chat was saved");
//     })
//     .catch((err) => {
//         console.log(err);
//     });
//     res.redirect("/Chats");
// });


// //Edit Route
// app.get("/Chats/:id/edit", async (req, res) => {
//     let {id} = req.params;
//     let chat = await Chat.findById(id);
//     res.render("edit.ejs", {chat});
// });


// //Update Route
// app.put("/Chats/:id",async (req, res) => {
//     let {id} = req.params;
//     let{msg} = req.body;  //let{msg: msg} = req.body;
//     //console.log(msg); time ane par dekhte h isse
//     msg = msg.replace(/\r?\n/g, "           ");// extra line from my side.....
//     let updatedChat = await Chat.findByIdAndUpdate(id,
//         {msg : msg},
//         {runValidators : true, new : true}
        
//     );
//     console.log(updatedChat);
//     res.redirect("/Chats");
// });



// //Destroy Route
// app.delete("/Chats/:id", async (req, res) => {
//     let {id} = req.params;
//     let deletedChat = await Chat.findByIdAndDelete(id);
//     console.log(deletedChat);
//     res.redirect("/Chats");
// });



// app.get("/", (req, res) => {
//     res.send("Root is working!");
// })

// app.listen(8080, () => {
//     console.log("Server is running on port 8080");
// })


//new code for new  projects........

require("dotenv").config();
console.log(process.env.MONGO_URI);
console.log(process.env.SESSION_SECRET);
console.log(process.env.PORT);

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        if (isValid) cb(null, true);
        else cb(new Error("Sirf images allowed hain"));
    }
});

const express = require("express");
const app = express();
const mongoose = require("mongoose");

const Chat = require("./models/chat.js");
const methodOverride = require("method-override");
const http = require("http");
const { Server } = require("socket.io");
const session = require("express-session");
const User = require("./models/user");
const bcrypt = require("bcrypt");


// require("dotenv").config();

// const express = require("express");
// const app = express();


app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
// app.use(session({
//     secret: "mysecretkey",
//     resave: false,
//     saveUninitialized: false
// }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

const server = http.createServer(app);
const io = new Server(server);

main()
.then(() => {
    console.log("Connection successful!");
})
.catch(err => console.log(err));

async function main() {
    // await mongoose.connect('mongodb://127.0.0.1:27017/whatsapp');
    await mongoose.connect(process.env.MONGO_URI);
}

//Index Route
app.get("/Chats", async (req, res) => {
    let Chats = await Chat.find();
    res.render("index.ejs", {Chats});
});


// new route for 2 person chat
app.get("/chat/:user", isLoggedIn, async (req, res) => {

    let { user } = req.params;

    

    if (req.session.user !== user) {
        return res.status(403).send("Access Denied");
    }

    let chats = await Chat.find({
    $or: [
        { from: "raj", to: "anshu" },
        { from: "anshu", to: "raj" }
    ]
}).sort({ created_at: 1 });

    const otherUser = user === "raj" ? "anshu" : "raj";
const otherUserData = await User.findOne({ username: otherUser });

res.render("2chat.ejs", {
    chats,
    currentUser: user,
    lastSeen: otherUserData?.lastSeen || null
});

});

//New Route
app.get("/Chats/new", (req, res) => {
    res.render("new.ejs");
});

//Create Route
// app.post("/chats", isLoggedIn, async (req, res) => {
//     try {

//         let { to, msg } = req.body;

// const from = req.session.user;
//         await Chat.create({ from, to, msg });
//         res.redirect(`/chat/${req.session.user}`);
//     } catch (err) {
//         console.log(err);
//         res.status(500).send("Error saving chat");
//     }
// });

app.post("/chats", isLoggedIn, async (req, res) => {
    try {

        let { to, msg } = req.body;

        msg = msg.trim();

        if (!msg) {
            return res.status(400).send("Message cannot be empty");
        }

        const from = req.session.user;

        await Chat.create({ from, to, msg });

        res.redirect(`/chat/${req.session.user}`);

    } catch (err) {

        console.log(err);
        res.status(500).send("Error saving chat");

    }
});


app.post("/upload", isLoggedIn, upload.single("image"), async (req, res) => {
    try {

        const from = req.session.user;
        const to = from === "raj" ? "anshu" : "raj";

        const newChat = await Chat.create({
            from,
            to,
            msg: "/uploads/" + req.file.filename,
            messageType: "image"
        });

        io.emit("receive-message", newChat);

        res.sendStatus(200);

    } catch (err) {
        console.log(err);
        res.status(500).send("Upload failed");
    }
});

//Edit Route
app.get("/Chats/:id/edit", async (req, res) => {
    let {id} = req.params;
    let chat = await Chat.findById(id);
    res.render("edit.ejs", {chat});
});

//Update Route
app.put("/Chats/:id", async (req, res) => {
    let {id} = req.params;
    let {msg} = req.body;
    msg = msg.replace(/\r?\n/g, "           ");
    let updatedChat = await Chat.findByIdAndUpdate(id,
        {msg : msg},
        {runValidators : true, new : true}
    );
    console.log(updatedChat);
    res.redirect("/Chats");
});

//Destroy Route

app.delete("/Chats/:id", isLoggedIn, async (req, res) => {
    console.log("DELETE route hit:", req.params.id);
    let { id } = req.params;
    const chat = await Chat.findById(id);
    if (!chat) return res.status(404).send("Not found");
    if (chat.from !== req.session.user) return res.status(403).send("Not Allowed");
    await Chat.findByIdAndDelete(id);
    io.emit("message-deleted", { id: id.toString() });
    res.sendStatus(200);
});


//Login page Route
app.get("/login", (req, res) => {
    res.render("login.ejs");
});





//Login post Route
app.post("/login", async (req, res) => {

    const { username, password } = req.body;

    
    const user = await User.findOne({ username });

    if (!user) {
    return res.send("Invalid username or password");
    }

    const match = await bcrypt.compare(
    password,
    user.password
    );

    if (!match) {
    return res.send("Invalid username or password");
}


    req.session.user = user.username;

    res.redirect(`/chat/${user.username}`);

});



//Logout Route
app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.send("Error logging out");
        }

        res.redirect("/login");
    });
});



//Route protection middleware
function isLoggedIn(req, res, next) {

    if (!req.session.user) {
        return res.redirect("/login");
    }

    next();
}

//Register Routes
app.get("/register", (req, res) => {
    res.render("2register.ejs");
});



//Register post Route
app.post("/register", async (req, res) => {

    try {

        const { username, password } = req.body;

        // const newUser = new User({
        //     username,
        //     password
        // });

        if (username !== "raj" && username !== "anshu") {
    return res.send("Only raj and anshu can register");
}

        const allowedUsers = ["raj", "anshu"];

// if (!allowedUsers.includes(username.toLowerCase())) {
//     return res.send("Only Raj and Anshu can register");
// }

        const hashedPassword = await bcrypt.hash(password, 10);

const newUser = new User({
    username,
    password: hashedPassword
});

        await newUser.save();

        res.redirect("/login");

    } catch (err) {

        console.log(err);
        res.send("Username already exists");

    }

});



app.get("/lastSeen/:username", isLoggedIn, async (req, res) => {
    const user = await User.findOne({ username: req.params.username });
    res.json({ lastSeen: user?.lastSeen || null });
});



app.get("/", (req, res) => {
    res.send("Root is working!");
});

const onlineUsers = new Set();

io.on("connection", (socket) => {
    console.log("User Connected");

    socket.on("message-seen", async (data) => {
        await Chat.updateMany(
            { to: data.seenBy, isRead: false },
            { isRead: true }
        );
        io.emit("update-seen", data);
    });

    socket.on("user-online", (username) => {
        socket.username = username;
        onlineUsers.add(username);
        io.emit("online-users", Array.from(onlineUsers));
    });

    socket.on("typing", (data) => {
        socket.broadcast.emit("user-typing", data);
    });

    socket.on("stop-typing", (data) => {
        socket.broadcast.emit("user-stop-typing", data);
    });

    

    socket.on("send-message", async (data) => {
    try {

        const cleanMsg = data.msg.trim();

        if (!cleanMsg) {
            return;
        }

        const newChat = await Chat.create({
    from: socket.username,
    to: data.to,
    msg: cleanMsg,
    messageType: "text",
    replyTo: data.replyTo || null
});

        io.emit("receive-message", newChat);

    } catch (err) {
        console.log(err);
    }
});


    socket.on("disconnect", async () => {
    if (socket.username) {
        onlineUsers.delete(socket.username);

        await User.findOneAndUpdate(
            { username: socket.username },
            { lastSeen: new Date() }
        );

        io.emit("online-users", Array.from(onlineUsers));
    }
    console.log("User Disconnected");
});


});

// server.listen(8080, () => {
//     console.log("Server is running on port 8080");
// });

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});