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

const createPostTemplate = (postData) => {
  return `<div class="post">
    <div class="mainContentContainer">
      <div class="userPhotoContainer">
        <img src="${postData.addedBy.profilePhoto}" />
      </div>
      <div class="postContentContainer">
        <div class="postHeader">
          <a class="showUnderline" href="/profile/${postData.addedBy.username}">${postData.addedBy.firstName} ${postData.addedBy.lastName}</a>
          <span class="postUsername">${postData.addedBy.username}</span>
          <span class="postDate">${postData.createdAt}</span>
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
          <div class="postButtonContainer">
            <button>
              <i class="far fa-comment-dots"></i>
            </button>
          </div>
          <div class="postButtonContainer">
            <button>
              <i class="fab fa-reddit-alien"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>`;
};
