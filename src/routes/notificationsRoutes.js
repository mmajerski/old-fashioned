const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  const payload = {
    pageTitle: "Notifications",
    loggedInUser: req.session.user,
    loggedInUserForJs: JSON.stringify(req.session.user)
  };

  res.status(200).render("notifications", payload);
});

module.exports = router;
