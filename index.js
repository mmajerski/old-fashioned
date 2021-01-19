const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
require("dotenv").config();

const { requireLogin } = require("./src/middlewares");
const loginRoute = require("./src/routes/loginRoutes");
const registerRoute = require("./src/routes/registerRoutes");
const logoutRoute = require("./src/routes/logoutRoutes");
const posts = require("./src/routes/api/posts");
const users = require("./src/routes/api/users");
const chats = require("./src/routes/api/chats");
const notifications = require("./src/routes/api/notifications");
const messages = require("./src/routes/api/messages");
const postRoutes = require("./src/routes/postRoute");
const profileRoutes = require("./src/routes/profileRoutes");
const uploadRoutes = require("./src/routes/uploadRoutes");
const searchRoutes = require("./src/routes/searchRoutes");
const messagesRoutes = require("./src/routes/messagesRoutes");
const notificationsRoutes = require("./src/routes/notificationsRoutes");

const { connectMongoDb } = require("./src/utils/connectMongo");

connectMongoDb();

const app = express();
const port = process.env.PORT || 3000;

app.set("view engine", "pug");
app.set("views", "./views");

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false
  })
);

app.use("/login", loginRoute);
app.use("/register", registerRoute);
app.use("/logout", logoutRoute);
app.use("/post", requireLogin, postRoutes);
app.use("/profile", requireLogin, profileRoutes);
app.use("/uploads", requireLogin, uploadRoutes);
app.use("/search", requireLogin, searchRoutes);
app.use("/messages", requireLogin, messagesRoutes);
app.use("/notifications", requireLogin, notificationsRoutes);
app.use("/api/posts", posts);
app.use("/api/users", users);
app.use("/api/chats", chats);
app.use("/api/messages", messages);
app.use("/api/notifications", notifications);

const server = app.listen(port, () =>
  console.log("Server is up on port " + port)
);

const io = require("socket.io")(server, { pingTimeout: 60000 });

app.get("/", requireLogin, (req, res) => {
  const payload = {
    message: "Hey",
    loggedInUser: req.session.user,
    loggedInUserForJs: JSON.stringify(req.session.user)
  };

  res.render("main", payload);
});

io.on("connection", (socket) => {
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join room", (room) => {
    socket.join(room);
  });

  socket.on("userTyping", (room, user) => {
    socket.in(room).emit("typing", user);
  });

  socket.on("stopTyping", (room) => {
    socket.in(room).emit("stopTyping");
  });

  socket.on("newMessage", (message) => {
    const chat = message.chat;

    if (!chat.users) {
      return;
    }

    chat.users.forEach((user) => {
      if (user._id === message.sender._id) {
        return;
      }

      socket.in(user._id).emit("messageReceived", message);
    });
  });

  socket.on("notificationReceived", (room) => {
    socket.in(room).emit("notificationReceived");
  });
});
