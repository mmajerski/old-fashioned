let bounceTime;
let selectedUsers = [];

$("#userSearchTextbox").keydown((e) => {
  clearTimeout(bounceTime);
  const textBox = $(e.target);

  if (textBox.val() === "" && (e.which === 8 || e.keyCode === 8)) {
    selectedUsers.pop();
    updateSelectedUsersHtml();
    $(".resultsContainer").empty();

    if (selectedUsers.length === 0) {
      $("#createChatButton").prop("disabled", true);
    }

    return;
  }

  bounceTime = setTimeout(() => {
    const value = textBox.val().trim();

    if (!value) {
      $(".resultsContainer").empty();
    } else {
      searchUsers(value);
    }
  }, 1000);
});

$("#createChatButton").click(() => {
  const data = JSON.stringify(selectedUsers);

  $.post("/api/chats", { users: data }, (chat) => {
    window.location.href = `/messages/${chat._id}`;
  });
});

const searchUsers = (term) => {
  $.get("/api/users", { search: term }, (results) => {
    results.forEach((result) => {
      renderSearchUsers(result, $(".resultsContainer"));
    });
  });
};

const renderSearchUsers = (result, container) => {
  if (
    result._id === loggedInUser._id ||
    selectedUsers.some((u) => u._id === result._id)
  ) {
    return;
  }

  const user = createUserTemplate(result, true);
  const el = $(user);
  el.click(() => {
    userSelected(result);
  });

  container.prepend(el);
};

const userSelected = (user) => {
  selectedUsers.push(user);
  updateSelectedUsersHtml();
  $("#userSearchTextbox").val("").focus();
  $(".resultsContainer").empty();
  $("#createChatButton").prop("disabled", false);
};

const updateSelectedUsersHtml = () => {
  const elems = [];

  selectedUsers.forEach((user) => {
    const name = `${user.firstName} ${user.lastName}`;
    const userElement = $(`<span class="selectedUser">${name}</span>`);
    elems.push(userElement);
  });

  $(".selectedUser").remove();
  $("#selectedUsers").prepend(elems);
};
