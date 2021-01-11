const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

app.set("view engine", "pug");
app.set("views", "./views");

const server = app.listen(port, () =>
  console.log("Server is up on port " + port)
);

app.get("/", function (req, res) {
  res.render("main", { title: "Hey", message: "Hello there!" });
});
