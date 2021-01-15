const express = require("express");
const User = require("../models/User");

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

router.get("/:username", async (req, res) => {
  const payload = await retrieveProfileData(
    req.params.username,
    req.session.user
  );

  res.status(200).render("profile", payload);
});

router.get("/:username/replies", async (req, res) => {
  const payload = await retrieveProfileData(
    req.params.username,
    req.session.user
  );
  payload.selectedTab = "replies";

  res.status(200).render("profile", payload);
});

const retrieveProfileData = async (username, loggedInUser) => {
  try {
    const user = await User.findOne({ username });

    return {
      pageTitle: "Profile",
      loggedInUser,
      loggedInUserForJs: JSON.stringify(loggedInUser),
      userProfile: user
    };
  } catch (error) {
    console.log(error);
  }
};

module.exports = router;
