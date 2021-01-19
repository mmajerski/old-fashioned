const express = require("express");
const mongoose = require("mongoose");

const Chat = require("../models/Chat");
const User = require("../models/User");

const router = express.Router();

router.get("/", (req, res) => {
  const payload = {
    pageTitle: "Messages",
    loggedInUser: req.session.user,
    loggedInUserForJs: JSON.stringify(req.session.user)
  };

  res.status(200).render("messages", payload);
});

router.get("/new", (req, res) => {
  const payload = {
    pageTitle: "New Message",
    loggedInUser: req.session.user,
    loggedInUserForJs: JSON.stringify(req.session.user)
  };

  res.status(200).render("newMessage", payload);
});

router.get("/:chatId", async (req, res) => {
  try {
    const payload = {
      pageTitle: "Chat",
      loggedInUser: req.session.user,
      loggedInUserForJs: JSON.stringify(req.session.user)
    };

    let chat = await Chat.findOne({
      _id: req.params.chatId,
      users: { $in: req.session.user._id }
    }).populate("users");

    // Direct communication between two users
    if (!chat) {
      const userFound = await User.findById(req.params.chatId);

      if (userFound) {
        chat = await getChatByUserId(req.session.user._id, userFound._id);
      }
    }

    if (!chat) {
      payload.errorMessage =
        "Chat does not exist or you do not have permission.";
    } else {
      payload.chat = chat;
    }

    res.status(200).render("chat", payload);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error.message);
  }
});

const getChatByUserId = async (loggedInUserId, otherUserId) => {
  return await Chat.findOneAndUpdate(
    {
      isGroup: false,
      users: {
        $size: 2,
        $all: [
          { $elemMatch: { $eq: mongoose.Types.ObjectId(loggedInUserId) } },
          { $elemMatch: { $eq: mongoose.Types.ObjectId(otherUserId) } }
        ]
      }
    },
    {
      $setOnInsert: {
        users: [loggedInUserId, otherUserId]
      }
    },
    { new: true, upsert: true }
  ).populate("users");
};

module.exports = router;
