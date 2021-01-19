$(document).ready(() => {
  $.get("/api/notifications", (data) => {
    data.forEach((notification) => {
      const template = createNotificationTemplate(notification);
      $(".resultsContainer").prepend(template);
    });
  });
});

$("#markAllNotificationsRead").click(() => {
  allNotificationsOpened();
});

const createNotificationTemplate = (notification) => {
  const className = notification.opened ? "" : "active";

  return `<a href="profile/${notification.from.username}" class="resultsContainer2 notification ${className}" data-id="${notification._id}">
    <div class="resultsImageContainer">
      <img src="${notification.from.profilePhoto}" />
    </div>
    <div class="resultsDetailsContainer ellipsis">
        <span class="ellipsis">${notification.from.username} just started to ${notification.type} you!</span>
    </div>
  </a>`;
};
