$(document).ready(() => {
  $.get("/api/posts", (posts) => {
    if (posts.length === 0) {
      return $(".postsContainer").append("<p>No items yet.</p>");
    }

    posts.forEach((post) => {
      const postTemplate = createPostTemplate(post);
      $(".postsContainer").prepend(postTemplate);
    });
  });
});
