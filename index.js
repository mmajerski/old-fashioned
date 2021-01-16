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
const postRoutes = require("./src/routes/postRoute");
const profileRoutes = require("./src/routes/profileRoutes");
const uploadRoutes = require("./src/routes/uploadRoutes");

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
app.use("/api/posts", posts);
app.use("/api/users", users);

const server = app.listen(port, () =>
  console.log("Server is up on port " + port)
);

app.get("/", requireLogin, (req, res) => {
  const payload = {
    message: "Hey",
    loggedInUser: req.session.user,
    loggedInUserForJs: JSON.stringify(req.session.user)
  };

  res.render("main", payload);
});
