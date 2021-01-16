const express = require("express");

const User = require("../../models/User");

const router = express.Router();

router.put("/:userId/follow", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.sendStatus(404);
    }

    const isFollowing =
      user.followers && user.followers.includes(req.session.user._id);

    const option = isFollowing ? "$pull" : "$addToSet";

    req.session.user = await User.findByIdAndUpdate(
      req.session.user._id,
      {
        [option]: { following: req.params.userId }
      },
      { new: true }
    );

    await User.findByIdAndUpdate(req.params.userId, {
      [option]: { followers: req.session.user._id }
    });

    res.status(200).send(req.session.user);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error.message);
  }
});

router.get("/:userProfileId/followers", async (req, res, next) => {
  try {
    const users = await User.find({
      following: { $in: [req.params.userProfileId] }
    });

    return res.status(200).send(users);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error.message);
  }
});

router.get("/:userProfileId/following", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userProfileId).populate(
      "following"
    );
    return res.status(200).send(user.following);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error.message);
  }
});

module.exports = router;
