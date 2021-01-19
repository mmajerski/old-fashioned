let connected = false;

const socket = io();
socket.emit("setup", loggedInUser);
socket.on("connected", () => {
  connected = true;
});

socket.on("messageReceived", (message) => {
  messageReceived(message);
});
