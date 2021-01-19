let connected = false;

const socket = io();
socket.emit("setup", loggedInUser);
socket.on("connected", () => {
  connected = true;
});

socket.on("messageReceived", (message) => {
  messageReceived(message);
});

socket.on("notificationReceived", (newNotification) => {
  $.get("/api/notifications/latest", (data) => {
    refreshNotificationsBadge();
  });
});

const emitNotification = (userId) => {
  if (userId === loggedInUser._id) {
    return;
  }

  socket.emit("notificationReceived", userId);
};
