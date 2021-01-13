const express = require("express");
const bcrypt = require("bcrypt");

const User = require("../models/User");

const app = express();

const router = express.Router();

app.set("view engine", "pug");
app.set("views", "./views");

router.get("/", (req, res) => {
  res.status(200).render("login");
});

router.post("/", async (req, res) => {
  const { login, password } = req.body;

  const trimmedLogin = login.trim();

  if (trimmedLogin && password) {
    try {
      const user = await User.findOne({
        $or: [{ username: trimmedLogin }, { email: trimmedLogin }]
      }).select("+password");
      if (!user) {
        return res.status(400).render("login", {
          ...req.body,
          errorMessage: "User does not exist."
        });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(400).render("login", {
          ...req.body,
          errorMessage: "Wrong login or password."
        });
      }

      req.session.user = user;
      return res.redirect("/");
    } catch (error) {
      console.log(error);

      return res.status(500).render("login", {
        ...req.body,
        errorMessage: "Something went wrong."
      });
    }
  } else {
    return res.status(200).render("login", {
      ...req.body,
      errorMessage: "Validation failed. Make sure each field has a valid value."
    });
  }
});

module.exports = router;
