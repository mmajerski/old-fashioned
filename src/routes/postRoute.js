const express = require("express");

const router = express.Router();

router.get("/:id", (req, res) => {
  const payload = {
    pageTitle: "Post",
    loggedInUser: req.session.user,
    loggedInUserForJs: JSON.stringify(req.session.user),
    postId: req.params.id
  };

  res.status(200).render("post", payload);
});

module.exports = router;
