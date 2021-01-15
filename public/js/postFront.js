$(document).ready(() => {
  $.get(`/api/posts/${postId}`, (results) => {
    renderPostWithReplies(results, $(".postsContainer"));
  });
});
