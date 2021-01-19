$(document).ready(() => {
  $.get("/api/chats", (data, status, xhr) => {
    data.forEach((chat) => {
      const template = createChatTemplate(chat);
      $(".resultsContainer").prepend(template);
    });
  });
});

const createChatTemplate = (chatData) => {
  const chatName = getChatName(chatData);
  const image = getChatImageElems(chatData);
  const latestMessage = chatData.latestMessage?.content || "";

  return `<a href="/messages/${chatData._id}" class="resultListItem">
    ${image}
    <div class="resultsDetailsContainer ellipsis">
      <span class="heading ellipsis">${chatName}</span>
      <span class="subtext ellipsis">${latestMessage}</span>
    </div>
  </a>`;
};

const getChatName = (chatData) => {
  let chatName = chatData.name;

  if (!chatName) {
    const otherUsers = getOtherChatUsers(chatData.users);
    const namesArray = otherUsers.map((user) => `${user.username}`);
    chatName = namesArray.join(", ");
  }

  return chatName;
};

const getOtherChatUsers = (users) => {
  if (users.length === 1) {
    return users;
  }

  return users.filter((user) => {
    return user._id != loggedInUser._id;
  });
};

const getChatImageElems = (chatData) => {
  const otherUsers = getOtherChatUsers(chatData.users);
  let groupChatClass = "";
  let chatImage = getUserChatImageElem(otherUsers[0]);

  if (otherUsers.length > 1) {
    groupChatClass = "groupChatImage";
    chatImage += getUserChatImageElem(otherUsers[1]);
  }

  return `<div class="resultsImageContainer ${groupChatClass}">${chatImage}</div>`;
};

const getUserChatImageElem = (user) => {
  if (!user || !user.profilePhoto) {
    return "";
  }

  return `<img src="${user.profilePhoto}" alt="User's photo" />`;
};
