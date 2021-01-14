$("#postTextarea").keyup((e) => {
  if ($(e.target).val().trim() === "") {
    $("#submitPostButton").prop("disabled", true);
    return;
  } else {
    $("#submitPostButton").prop("disabled", false);
  }
});

$("#submitPostButton").click((e) => {
  const data = {
    content: $("#postTextarea").val()
  };

  $.post("/api/posts", data, (response, status, xhr) => {
    const postTemplate = createPostTemplate(response);
    $(".postsContainer").prepend(postTemplate);
    $("#postTextarea").val("");
  });
});

$(document).on("click", ".alienButton", (e) => {
  const postId = extractPostId($(e.target));

  if (!postId) {
    return;
  }

  $.ajax({
    url: `/api/posts/${postId}/alien`,
    type: "PUT",
    success: (postData) => {
      $(e.target)
        .find("span")
        .text(postData.aliens.length || "");

      if (postData.aliens.includes(loggedInUser._id)) {
        $(e.target).addClass("hasAliened");
      } else {
        $(e.target).removeClass("hasAliened");
      }
    }
  });
});

const createPostTemplate = (postData) => {
  const timestamp = timeDifference(new Date(), new Date(postData.createdAt));

  const alienButtonActive = postData.aliens.includes(loggedInUser._id)
    ? "hasAliened"
    : "";

  return `<div class="post" data-id="${postData._id}">
    <div class="mainContentContainer">
      <div class="userPhotoContainer">
        <img src="${postData.addedBy.profilePhoto}" />
      </div>
      <div class="postContentContainer">
        <div class="postHeader">
          <a class="showUnderline" href="/profile/${
            postData.addedBy.username
          }">${postData.addedBy.firstName} ${postData.addedBy.lastName}</a>
          <span class="postUsername">${postData.addedBy.username}</span>
          <span class="postDate">${timestamp}</span>
        </div>
        <div class="postBody">
          <span>${postData.content}</span>
        </div>
        <div class="postFooter">
          <div class="postButtonContainer">
            <button>
              <i class="fas fa-reply"></i>
            </button>
          </div>
          <div class="postButtonContainer orange">
            <button class="replied">
              <i class="far fa-comment-dots"></i>
            </button>
          </div>
          <div class="postButtonContainer blue">
            <button class="alienButton ${alienButtonActive}">
              <i class="fab fa-reddit-alien"></i>
              <span>${postData.aliens.length || ""}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>`;
};

const extractPostId = (elem) => {
  const isRoot = elem.hasClass("post");
  const rootEl = isRoot ? elem : elem.closest(".post");
  const postId = rootEl.data().id;

  if (!postId) {
    return;
  }

  return postId;
};

function timeDifference(current, previous) {
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const msPerMonth = msPerDay * 30;
  const msPerYear = msPerDay * 365;

  const elapsed = current - previous;

  if (elapsed < msPerMinute) {
    if (elapsed / 1000 < msPerMinute) {
      return "A few seconds ago";
    }
    return Math.round(elapsed / 1000) + " seconds ago";
  } else if (elapsed < msPerHour) {
    if (Math.round(elapsed / msPerMinute) < 2) {
      return Math.round(elapsed / msPerMinute) + " minute ago";
    }
    return Math.round(elapsed / msPerMinute) + " minutes ago";
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + " hours ago";
  } else if (elapsed < msPerMonth) {
    return Math.round(elapsed / msPerDay) + " days ago";
  } else if (elapsed < msPerYear) {
    return Math.round(elapsed / msPerMonth) + " months ago";
  } else {
    return Math.round(elapsed / msPerYear) + " years ago";
  }
}
