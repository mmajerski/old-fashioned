const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  const payload = {
    pageTitle: "Search",
    loggedInUser: req.session.user,
    loggedInUserForJs: JSON.stringify(req.session.user)
  };

  res.status(200).render("search", payload);
});

router.get("/:selectedTab", (req, res, next) => {
  const payload = {
    pageTitle: "Search",
    loggedInUser: req.session.user,
    loggedInUserForJs: JSON.stringify(req.session.user),
    selectedTab: req.params.selectedTab
  };

  res.status(200).render("search", payload);
});

module.exports = router;
