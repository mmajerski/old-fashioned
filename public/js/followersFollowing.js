$(document).ready(() => {
  loadFollow();
});

const loadFollow = () => {
  $.get(
    `/api/users/${userProfileId}/${
      selectedTab === "followers" ? "followers" : "following"
    }`,
    (results) => {
      if (results.length === 0) {
        return $(".resultsContainer").append("<p>No items yet.</p>");
      }

      results.forEach((result) => {
        const user = createUserTemplate(result, true);
        $(".resultsContainer").prepend(user);
      });
    }
  );
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
