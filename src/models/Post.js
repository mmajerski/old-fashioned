const mongoose = require("mongoose");
const { Schema } = mongoose;

const postSchema = new Schema(
  {
    content: {
      type: String,
      trim: true
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    pinned: Boolean,
    aliens: [{ type: Schema.Types.ObjectId, ref: "User" }],
    bumpUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    bumpData: { type: Schema.Types.ObjectId, ref: "Post" },
    replyTo: { type: Schema.Types.ObjectId, ref: "Post" }
  },
  {
    timestamps: true
  }
);

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
