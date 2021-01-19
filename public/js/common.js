let cropper;

$("#postTextarea, #replyTextarea").keyup((e) => {
  const isModalOpen = $(e.target).parents(".modal").length === 1;

  if ($(e.target).val().trim() === "") {
    if (isModalOpen) {
      $("#submitReplyButton").prop("disabled", true);
      return;
    }

    $("#submitPostButton").prop("disabled", true);
    return;
  } else {
    if (isModalOpen) {
      $("#submitReplyButton").prop("disabled", false);
      return;
    }
    $("#submitPostButton").prop("disabled", false);
  }
});

$("#submitPostButton, #submitReplyButton").click((e) => {
  const isModal = $(e.target).parents(".modal").length === 1;

  const data = {
    content: isModal ? $("#replyTextarea").val() : $("#postTextarea").val()
  };

  if (isModal) {
    const id = $(e.target).data().id;
    data.replyTo = id;
  }

  $.post("/api/posts", data, (response, status, xhr) => {
    if ($(".postsContainer p").length === 1) {
      $(".postsContainer").empty();
    }

    if (data.replyTo) {
      location.reload();
    } else {
      const postTemplate = createPostTemplate(response);
      $(".postsContainer").prepend(postTemplate);
      $("#postTextarea").val("");
      $("#submitPostButton").prop("disabled", true);
    }
  });
});

$(document).on("click", ".bumpButton", (e) => {
  const postId = extractPostId($(e.target));

  if (!postId) {
    return;
  }

  $.ajax({
    url: `/api/posts/${postId}/bump`,
    type: "POST",
    success: (postData) => {
      if (!postData) {
        location.reload();
        return;
      }

      $(e.target)
        .find("span")
        .text(postData.bumpUsers.length || "");

      if (postData.bumpUsers.includes(loggedInUser._id)) {
        $(e.target).addClass("hasBumped");
      } else {
        $(e.target).removeClass("hasBumped");
      }

      location.reload();
    }
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

$(document).on("click", ".post", (e) => {
  const postId = extractPostId($(e.target));
  if (postId && !$(e.target).is("button")) {
    window.location.href = "/post/" + postId;
  }
});

$("#replyModal").on("show.bs.modal", (e) => {
  const postId = extractPostId($(e.relatedTarget));
  $("#submitReplyButton").data("id", postId);

  $.get(`/api/posts/${postId}`, ({ post }) => {
    const postTemplate = createPostTemplate(post);
    $("#clickedPostContainer").prepend(postTemplate);
  });
});

$("#replyModal").on("hidden.bs.modal", () => {
  $("#clickedPostContainer").empty();
});

$("#deletePostModal").on("show.bs.modal", (e) => {
  const postId = extractPostId($(e.relatedTarget));
  $("#deletePostButton").data("id", postId);
});

$("#pinPostModal").on("show.bs.modal", (e) => {
  const postId = extractPostId($(e.relatedTarget));
  $("#pinPostButton").data("id", postId);
});

$("#unpinPostModal").on("show.bs.modal", (e) => {
  const postId = extractPostId($(e.relatedTarget));
  $("#unpinPostButton").data("id", postId);
});

$("#deletePostButton").click((e) => {
  const postId = $(e.target).data("id");

  $.ajax({
    url: `/api/posts/${postId}`,
    type: "DELETE",
    success: (postData) => {
      location.reload();
    }
  });
});

$("#pinPostButton").click((e) => {
  const postId = $(e.target).data("id");

  $.ajax({
    url: `/api/posts/${postId}`,
    type: "PUT",
    data: { pinnedPost: true },
    success: (postData) => {
      location.reload();
    }
  });
});

$("#unpinPostButton").click((e) => {
  const postId = $(e.target).data("id");

  $.ajax({
    url: `/api/posts/${postId}`,
    type: "PUT",
    data: { pinnedPost: false },
    success: (postData) => {
      location.reload();
    }
  });
});

$("#fileUpload").change(function () {
  if (this.files && this.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const image = document.getElementById("imagePreview");
      image.src = e.target.result;
      if (cropper) {
        cropper.destroy();
      }

      cropper = new Cropper(image, { aspectRatio: 1 / 1, background: false });
    };
    reader.readAsDataURL(this.files[0]);
  }
});

$("#uploadImageButton").click(() => {
  const canvas = cropper.getCroppedCanvas();
  if (!canvas) {
    return;
  }

  canvas.toBlob((blob) => {
    const formData = new FormData();
    formData.append("croppedImage", blob);

    $.ajax({
      url: "/api/users/profilePhoto",
      type: "POST",
      data: formData,
      processData: false, // do not convert to string
      contentType: false, // do not add Content-Type header
      success: (data, status, xhr) => {
        location.reload();
      }
    });
  });
});

$("#coverUpload").change(function () {
  if (this.files && this.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const image = document.getElementById("coverPreview");
      image.src = e.target.result;
      if (cropper) {
        cropper.destroy();
      }

      cropper = new Cropper(image, { aspectRatio: 1 / 1, background: false });
    };
    reader.readAsDataURL(this.files[0]);
  }
});

$("#coverImageButton").click(() => {
  const canvas = cropper.getCroppedCanvas();
  if (!canvas) {
    return;
  }

  canvas.toBlob((blob) => {
    const formData = new FormData();
    formData.append("croppedImage", blob);

    $.ajax({
      url: "/api/users/coverPhoto",
      type: "POST",
      data: formData,
      processData: false, // do not convert to string
      contentType: false, // do not add Content-Type header
      success: (data, status, xhr) => {
        location.reload();
      }
    });
  });
});

$(document).on("click", ".followButton", (e) => {
  const userId = $(e.target).data().user;

  $.ajax({
    url: `/api/users/${userId}/follow`,
    type: "PUT",
    success: (data, status, xhr) => {
      if (xhr.status === 404) {
        return;
      }

      let updateValue = 1;
      if (data.following && data.following.includes(userId)) {
        $(e.target).addClass("following");
        $(e.target).text("Following");
      } else {
        $(e.target).removeClass("following");
        $(e.target).text("Follow");
        updateValue = -1;
      }

      const followersLabel = $("#followersTotal");
      if (followersLabel.length !== 0) {
        const followersText = followersLabel.text();
        followersLabel.text(+followersText + updateValue);
      }
    }
  });
});

const createPostTemplate = (postData, mainPost = false) => {
  const bumpedBy = postData.bumpData ? postData.addedBy.username : null;
  postData = postData.bumpData ? postData.bumpData : postData;

  const timestamp = timeDifference(new Date(), new Date(postData.createdAt));

  const alienButtonActive = postData.aliens.includes(loggedInUser._id)
    ? "hasAliened"
    : "";

  const bumpedButtonActive = postData.bumpUsers.includes(loggedInUser._id)
    ? "hasBumped"
    : "";

  let isReply = "";
  if (postData.replyTo && postData.replyTo._id) {
    const replyToUsername = postData.replyTo.addedBy.username;
    isReply = `<div class="isReply">
      Replied to <a href="/profile/${replyToUsername}">${replyToUsername}</a>
    </div>`;
  }

  let deleteButton = "";
  let pinnedClass = "";
  if (postData.addedBy._id === loggedInUser._id) {
    if (postData.pinnedPost) {
      pinnedClass = "active";
    }

    deleteButton = `<button data-id="${
      postData._id
    }" data-toggle="modal" data-target="#pinPostModal" class="pinnedButton ${pinnedClass}">
      <i class="fas fa-thumbtack"></i>
    </button>
   ${
     postData.pinnedPost
       ? ` <button data-id="${postData._id}" data-toggle="modal" data-target="#unpinPostModal" class="pinnedButton">
   <i class="fas fa-unlink"></i>`
       : ""
   }
    </button>
    <button data-id="${
      postData._id
    }" data-toggle="modal" data-target="#deletePostModal">
      <i class="far fa-trash-alt"></i>
    </button>`;
  }

  return `<div class="post ${mainPost ? "largeFont" : ""}" data-id="${
    postData._id
  }">
    <div class="additionalContainer">
      ${
        bumpedBy
          ? `<span>
            <i class="fas fa-exclamation"></i>
            Bumped by <a href="/profile/${bumpedBy}">${bumpedBy}</a>
          </span>`
          : ""
      }
    </div>
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
          ${deleteButton}
        </div>
        ${isReply}
        <div class="postBody">
          <span>${postData.content}</span>
        </div>
        <div class="postFooter">
          <div class="postButtonContainer">
            <button data-toggle="modal" data-target="#replyModal">
              <i class="fas fa-reply"></i>
            </button>
          </div>
          <div class="postButtonContainer orange">
            <button class="bumpButton ${bumpedButtonActive}">
              <i class="fas fa-level-up-alt"></i>
              <span>${postData.bumpUsers.length || ""}</span>
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

const createUserTemplate = (userData, showFollowButton) => {
  const isFollowing = loggedInUser.following.includes(userData._id);
  const option = isFollowing ? "Following" : "Follow";
  const buttonClass = isFollowing ? "followButton following" : "followButton";

  let followButton = "";
  if (showFollowButton && loggedInUser._id !== userData._id) {
    followButton = `<div class="followButtonContainer">
      <button class="${buttonClass}" data-user="${userData._id}">${option}</button>
    </div>`;
  }

  return `<div class="user">
    <div class="userPhotoContainer">
      <img src=${userData.profilePhoto} />
    </div>
    <div class="userDetailsContainer">
      <div class="header">
        <a href="/profile/${userData.username}" class="showUnderline">${userData.firstName} ${userData.lastName}</a>
        <span class="username">${userData.username}</span>
      </div>
    </div>
    ${followButton}
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

const messageReceived = (message) => {
  if ($(".chatContainer").length == 0) {
    // notification
  } else {
    const template = createMessageTemplate(message);
    $(".messages").append(template);
  }
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

const renderPostWithReplies = (results, container) => {
  container.empty();

  if (results.replyTo && results.replyTo._id) {
    const template = createPostTemplate(results.replyTo);
    container.prepend(template);
  }

  const mainPost = createPostTemplate(results.post, true);
  container.prepend(mainPost);

  results.replies.forEach((reply) => {
    const template = createPostTemplate(reply);
    container.prepend(template);
  });
};
