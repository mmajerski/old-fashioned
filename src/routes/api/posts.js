const express = require("express");

const Post = require("../../models/Post");
const User = require("../../models/User");

const router = express.Router();

router.get("/", async (req, res, next) => {
  const searchObj = req.query;

  if (searchObj.isReply) {
    const isReply = searchObj.isReply === "true";
    searchObj.replyTo = { $exists: isReply };
    delete searchObj.isReply;
  }

  if (searchObj.search) {
    searchObj.content = { $regex: searchObj.search, $options: "i" };
    delete searchObj.search;
  }

  try {
    const posts = await getPosts(searchObj);
    return res.status(200).send(posts);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error.message);
  }
});

const getPosts = async (filter) => {
  const posts = await Post.find(filter)
    .populate("addedBy")
    .populate("bumpData")
    .populate("replyTo")
    .sort({ createdAt: 1 });
  let populatedPosts = await User.populate(posts, {
    path: "bumpData.addedBy"
  });
  populatedPosts = await User.populate(posts, { path: "replyTo.addedBy" });

  return populatedPosts;
};

router.get("/:id", async (req, res, next) => {
  const postId = req.params.id;

  try {
    const post = await Post.findById(postId)
      .populate("bumpData")
      .populate("addedBy");
    if (!post) {
      return res.status(400).send("No post found.");
    }

    const results = {
      post
    };

    if (post.replyTo) {
      results.replyTo = post.replyTo;
    }

    results.replies = await getPosts({ replyTo: postId });

    return res.status(200).send(results);
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
    addedBy: req.session.user,
    replyTo: req.body.replyTo ? req.body.replyTo : undefined
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
      const bumped = await Post.create({
        addedBy: userId,
        bumpData: postId
      });

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
      ).populate("addedBy");

      return res.status(200).send(post);
    } else {
      await User.findByIdAndUpdate(userId, {
        $pull: { bumpes: bumpedPost._id }
      });
      await Post.findByIdAndUpdate(
        postId,
        {
          $pull: { bumpUsers: userId }
        },
        { new: true }
      );

      return res.status(204).send();
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

router.delete("/:postId", async (req, res, next) => {
  try {
    await Post.findByIdAndDelete(req.params.postId);
    await Post.deleteMany({
      $or: [{ replyTo: req.params.postId }, { bumpData: req.params.postId }]
    });
    return res.sendStatus(202);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error.message);
  }
});

router.put("/:postId", async (req, res, next) => {
  try {
    await Post.updateMany({ addedBy: req.session.user }, { pinnedPost: false });

    await Post.findByIdAndUpdate(req.params.postId, req.body);

    return res.sendStatus(204);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error.message);
  }
});

module.exports = router;
