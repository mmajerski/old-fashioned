const mongoose = require("mongoose");
const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    to: { type: Schema.Types.ObjectId, ref: "User" },
    from: { type: Schema.Types.ObjectId, ref: "User" },
    type: String,
    opened: {
      type: Boolean,
      default: false
    },
    entityId: Schema.Types.ObjectId // Could be post, user or anything...
  },
  {
    timestamps: true
  }
);

notificationSchema.statics.insertNotification = (to, from, type, entityId) => {
  const data = {
    to,
    from,
    type,
    entityId
  };

  Notification.deleteOne(data);

  return Notification.create(data);
};

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
