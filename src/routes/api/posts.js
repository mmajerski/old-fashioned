const express = require("express");

const Post = require("../../models/Post");
const User = require("../../models/User");

const router = express.Router();

router.get("/", (req, res, next) => {});

router.post("/", async (req, res, next) => {
  if (!req.body.content) {
    return res.status(400).send("You did not sent any content.");
  }

  const postData = new Post({
    content: req.body.content,
    addedBy: req.session.user
  });

  try {
    const newPost = await postData.save();
    const populatedWithUser = await User.populate(newPost, { path: "addedBy" });
    return res.status(201).send(populatedWithUser);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error.message);
  }
});

module.exports = router;
