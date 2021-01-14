const express = require("express");

const Post = require("../../models/Post");
const User = require("../../models/User");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate("addedBy")
      .populate("bumpData")
      .sort({ createdAt: 1 });
    const populatedPosts = await User.populate(posts, {
      path: "bumpData.addedBy"
    });

    return res.status(200).send(populatedPosts);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error.message);
  }
});

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

router.post("/:postId/bump", async (req, res, next) => {
  const { postId } = req.params;
  const userId = req.session.user._id;

  try {
    const bumpedPost = await Post.findOneAndDelete({
      addedBy: userId,
      bumpData: postId
    });

    if (!bumpedPost) {
      const bumped = await Post.create({ addedBy: userId, bumpData: postId });

      req.session.user = await User.findByIdAndUpdate(
        userId,
        {
          $addToSet: { bumpes: bumped._id }
        },
        { new: true }
      );

      const post = await Post.findByIdAndUpdate(
        postId,
        {
          $addToSet: { bumpUsers: userId }
        },
        { new: true }
      );

      return res.status(200).send(post);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(error.message);
  }
});

router.put("/:postId/alien", async (req, res, next) => {
  const { postId } = req.params;
  const userId = req.session.user._id;

  const isAlien =
    req.session.user.aliens && req.session.user.aliens.includes(postId);

  try {
    if (!isAlien) {
      req.session.user = await User.findByIdAndUpdate(
        userId,
        {
          $addToSet: { aliens: postId }
        },
        { new: true }
      );

      const post = await Post.findByIdAndUpdate(
        postId,
        {
          $addToSet: { aliens: userId }
        },
        { new: true }
      );

      return res.status(200).send(post);
    } else {
      req.session.user = await User.findByIdAndUpdate(
        userId,
        {
          $pull: { aliens: postId }
        },
        { new: true }
      );

      const post = await Post.findByIdAndUpdate(
        postId,
        {
          $pull: { aliens: userId }
        },
        { new: true }
      );

      return res.status(200).send(post);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(error.message);
  }
});

module.exports = router;
