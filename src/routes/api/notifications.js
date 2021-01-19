const express = require("express");

const Notification = require("../../models/Notification");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const searchObj = { to: req.session.user._id, type: { $ne: "newMessage" } };

    if (req.query.unreadOnly) {
      searchObj.opened = false;
    }

    const results = await Notification.find(searchObj)
      .populate("to")
      .populate("from")
      .sort({ createdAt: 1 });

    return res.status(200).send(results);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error.message);
  }
});

router.get("/latest", async (req, res, next) => {
  try {
    const results = await Notification.findOne({
      to: req.session.user._id
    })
      .populate("to")
      .populate("from")
      .sort({ createdAt: 1 });

    return res.status(200).send(results);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error.message);
  }
});

router.put("/:id/opened", async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, {
      opened: true
    });

    return res.sendStatus(204);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error.message);
  }
});

router.put("/opened", async (req, res, next) => {
  try {
    await Notification.updateMany(
      { to: req.session.user._id },
      {
        opened: true
      }
    );

    return res.sendStatus(204);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error.message);
  }
});

module.exports = router;
