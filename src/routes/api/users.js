const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
var upload = multer({ dest: "uploads/" });

const User = require("../../models/User");
const Notification = require("../../models/Notification");

const router = express.Router();

router.get("/", async (req, res, next) => {
  let searchObj;
  if (req.query.search) {
    searchObj = {
      $or: [
        { firstName: { $regex: req.query.search, $options: "i" } },
        { lastName: { $regex: req.query.search, $options: "i" } },
        { username: { $regex: req.query.search, $options: "i" } }
      ]
    };
  }

  try {
    const results = await User.find(searchObj);
    return res.status(200).send(results);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error.message);
  }
});

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

    if (!isFollowing) {
      await Notification.insertNotification(
        req.params.userId,
        req.session.user._id,
        "follow",
        req.session.user._id
      );
    }

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

router.post(
  "/profilePhoto",
  upload.single("croppedImage"),
  async (req, res, next) => {
    if (!req.file) {
      console.log("No file uploaded");
      return res.sendStatus(400);
    }

    const filePath = `/uploads/images/${req.file.filename}.png`;
    const tempPath = req.file.path;
    const targetPath = path.join(__dirname, `../../../${filePath}`);

    fs.rename(tempPath, targetPath, async (error) => {
      if (error) {
        console.log(error);
        return res.sendStatus(400);
      }

      req.session.user = await User.findByIdAndUpdate(
        req.session.user._id,
        {
          profilePhoto: filePath
        },
        { new: true }
      );

      res.sendStatus(204);
    });
  }
);

router.post(
  "/coverPhoto",
  upload.single("croppedImage"),
  async (req, res, next) => {
    if (!req.file) {
      console.log("No file uploaded");
      return res.sendStatus(400);
    }

    const filePath = `/uploads/images/${req.file.filename}.png`;
    const tempPath = req.file.path;
    const targetPath = path.join(__dirname, `../../../${filePath}`);

    fs.rename(tempPath, targetPath, async (error) => {
      if (error) {
        console.log(error);
        return res.sendStatus(400);
      }

      req.session.user = await User.findByIdAndUpdate(
        req.session.user._id,
        {
          coverPhoto: filePath
        },
        { new: true }
      );

      res.sendStatus(204);
    });
  }
);

module.exports = router;
