$(document).ready(() => {
  loadPosts();
});

const loadPosts = () => {
  $.get(
    "/api/posts",
    {
      addedBy: userProfileId,
      isReply: selectedTab === "replies" ? true : false
    },
    (posts) => {
      if (posts.length === 0) {
        return $(".postsContainer").append("<p>No items yet.</p>");
      }

      posts.forEach((post) => {
        const postTemplate = createPostTemplate(post);
        $(".postsContainer").prepend(postTemplate);
      });
    }
  );
};
