let typing = false;
let lastTypingTime;

$(document).ready(() => {
  socket.emit("join room", chatId);
  socket.on("typing", (user) => {
    $(".typingGif").show();
    $("#usernameP").text(user.username + " is typing");
  });
  socket.on("stopTyping", () => {
    $(".typingGif").hide();
    $("#usernameP").text("");
  });

  $.get(`/api/messages/${chatId}/messages`, (data) => {
    data.forEach((message) => {
      const template = createMessageTemplate(message);
      $(".messages").append(template);
    });

    autoBottomScroll(true);
    markAllMessagesAsRead();

    $(".loaderContainer").remove();
    $(".chatContainer").css("visibility", "visible");
  });
});

$("#changeChatNameButton").click(() => {
  const name = $("#chatNameInput").val().trim();
  $.ajax({
    url: `/api/chats/${chatId}`,
    type: "PUT",
    data: { name },
    success: (data, status, xhr) => {
      location.reload();
    }
  });
});

$(".sendMessageButton").click(() => {
  sendMessage();
});

$(".inputText").keydown((e) => {
  userTyping();

  if (e.which === 13 && !e.shiftKey) {
    sendMessage();
    return false;
  }
});

const userTyping = () => {
  if (!connected) {
    return;
  }

  if (!typing) {
    typing = true;
    socket.emit("userTyping", chatId, loggedInUser);
  }

  lastTypingTime = new Date().getTime();
  const timerLength = 3000;

  setTimeout(() => {
    const timeNow = new Date().getTime();
    const timeDiff = timeNow - lastTypingTime;
    if (timeDiff >= timerLength && typing) {
      socket.emit("stopTyping", chatId);
      typing = false;
    }
  }, timerLength);
};

const sendMessage = () => {
  const content = $(".inputText").val().trim();
  if (content) {
    $(".inputText").val("");
    socket.emit("stopTyping", chatId);
    typing = false;

    $.post("/api/messages", { content, chatId }, (data, status, xhr) => {
      if (xhr.status !== 201) {
        $(".inputText").val(content);
        return;
      }

      const template = createMessageTemplate(data);
      $(".messages").append(template);
      if (connected) {
        socket.emit("newMessage", data);
      }
      autoBottomScroll();
    });
  }
};

const createMessageTemplate = (message) => {
  const isMyMessage = message.sender._id === loggedInUser._id;
  const liClassName = isMyMessage ? "myMessage" : "othersMessage";

  const messageDiv = `<li class="message ${liClassName}">
    <span class="messageAuthor">
      ${message.sender.username}
      <img src="${message.sender.profilePhoto}" alt="Profile photo" />
    </span>
    <div class="messageContainer">
      <span class="messageTime">${timeDifference(
        new Date(),
        new Date(message.createdAt)
      )}</span>
      <span class="messageBody">
        ${message.content}
      </span>
    </div>
  </li>`;

  return messageDiv;
};

const autoBottomScroll = (animated) => {
  const container = $(".messages");

  let total = 0;
  $(".message").each(() => {
    total += $(this).height();
  });

  if (animated) {
    container.animate({ scrollTop: total }, "slow");
  } else {
    container.scrollTop(total);
  }
};

const markAllMessagesAsRead = () => {
  $.ajax({
    url: `/api/chats/${chatId}/messages/markAsRead`,
    type: "PUT",
    success: () => {
      refreshMessagesBadge();
    }
  });
};
