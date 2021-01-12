const express = require("express");

const User = require("../models/User");

const app = express();

const router = express.Router();

app.set("view engine", "pug");
app.set("views", "./views");

router.get("/", (req, res) => {
  res.status(200).render("register");
});

router.post("/", async (req, res) => {
  const {
    firstName,
    lastName,
    username,
    email,
    password,
    confirmPassword
  } = req.body;

  const trimmedFirstName = firstName.trim();
  const trimmedLastName = lastName.trim();
  const trimmedUsername = username.trim();
  const trimmedEmail = email.trim();

  if (
    trimmedFirstName &&
    trimmedLastName &&
    trimmedUsername &&
    trimmedEmail &&
    password
  ) {
    if (password !== confirmPassword) {
      return res.status(400).render("register", {
        ...req.body,
        errorMessage: "Passwords don't match."
      });
    }

    try {
      const userExists = await User.findOne({
        $or: [{ username: trimmedUsername }, { email: trimmedEmail }]
      });
      if (userExists) {
        let errorMessage;
        if (trimmedEmail === userExists.email) {
          errorMessage = "Email already in use.";
        } else {
          errorMessage = "Username already in use.";
        }

        return res.status(400).render("register", {
          ...req.body,
          errorMessage
        });
      }

      const newUser = new User({
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        username: trimmedUsername,
        email: trimmedEmail,
        password
      });
      const user = await newUser.save();
      req.session.user = user;

      return res.redirect("/");
    } catch (error) {
      console.log(error);

      return res.status(500).render("register", {
        ...req.body,
        errorMessage: "Something went wrong."
      });
    }
  } else {
    return res.status(200).render("register", {
      ...req.body,
      errorMessage: "Validation failed. Make sure each field has a valid value."
    });
  }
});

module.exports = router;
