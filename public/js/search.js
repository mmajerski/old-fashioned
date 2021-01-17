let bounceTime;

$("#searchBox").keydown((e) => {
  clearTimeout(bounceTime);
  const textBox = $(e.target);
  const searchType = textBox.data().search;

  bounceTime = setTimeout(() => {
    const value = textBox.val().trim();

    if (!value) {
      $(".resultsContainer").empty();
    } else {
      search(value, searchType);
    }
  }, 1000);
});

const search = (term, searchType) => {
  const url = searchType === "users" ? "/api/users" : "/api/posts";

  $.get(url, { search: term }, (results) => {
    if (searchType === "posts") {
      results.forEach((result) => {
        const postTemplate = createPostTemplate(result);
        $(".resultsContainer").prepend(postTemplate);
      });
    } else {
      results.forEach((result) => {
        const userTemplate = createUserTemplate(result, true);
        $(".resultsContainer").prepend(userTemplate);
      });
    }
  });
};
