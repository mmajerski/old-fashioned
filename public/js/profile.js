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

      let pinnedPost;
      posts.forEach((post) => {
        if (post.pinnedPost) {
          pinnedPost = post;
          return;
        }
        const postTemplate = createPostTemplate(post);
        $(".postsContainer").prepend(postTemplate);
      });

      if (pinnedPost) {
        const postTemplate = createPostTemplate(pinnedPost);
        $(".postsContainer").prepend(postTemplate);
      }
    }
  );
};
