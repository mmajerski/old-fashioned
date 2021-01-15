const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  const payload = {
    pageTitle: "Profile",
    loggedInUser: req.session.user,
    loggedInUserForJs: JSON.stringify(req.session.user),
    userProfile: req.session.user
  };

  res.status(200).render("profile", payload);
});

module.exports = router;
