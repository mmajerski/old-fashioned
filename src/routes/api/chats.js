const express = require("express");

const Chat = require("../../models/Chat");

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const users = JSON.parse(req.body.users);
    users.push(req.session.user);

    const chatData = { users, isGroup: true };

    const result = await Chat.create(chatData);

    return res.status(200).send(result);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error.message);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const chats = await Chat.find({
      users: { $in: req.session.user._id }
    })
      .populate("users")
      .populate("latestMessage");

    return res.status(200).send(chats);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error.message);
  }
});

router.put("/:chatId", async (req, res, next) => {
  try {
    await Chat.findByIdAndUpdate(req.params.chatId, req.body);

    return res.sendStatus(204);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error.message);
  }
});

module.exports = router;
