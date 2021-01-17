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
