// Front (watch.pug)
const videoContainer = document.getElementById("videoContainer");
const commentForm = document.getElementById("commentForm");
const deleteBtns = document.querySelectorAll(".delete-btn");

// const addComment = (text, id) => {
//   const videoComments = document.querySelector(".video__comments ul");
//   const newComment = document.createElement("li");
//   newComment.dataset.id = id;
//   newComment.className = "video__comment";
//   const icon = document.createElement("i");
//   icon.className = "fas fa-comment";
//   const span = document.createElement("span");
//   span.innerText = ` ${text}`;
//   const span2 = document.createElement("span");
//   span2.innerText = " ❌";
//   newComment.appendChild(icon);
//   newComment.appendChild(span);
//   newComment.appendChild(span2);
//   videoComments.prepend(newComment);
//   span2.addEventListener("click", handleDelete);
// };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (commentForm.dataset.loggedin === "false") {
    // 사용자가 로그인하지 않은 경우
    alert("로그인 후에만 댓글을 남길 수 있습니다.");
    return;
  }

  const textarea = commentForm.querySelector("input");
  const text = textarea.value;
  const videoId = videoContainer.dataset.id;
  if (text === "") {
    alert("댓글을 입력해주세요!");
    return;
  }
  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  // console.log(response);
  if (response.status === 201) {
    textarea.value = "";
    // const newCommentId = await response.json();
    // addComment(text, newCommentId);
    window.location.reload();
  }
};

if (commentForm) {
  commentForm.addEventListener("submit", handleSubmit);
}

const handleDelete = async (e) => {
  const li = e.target.parentElement;
  const commentId = li.dataset.id;
  const videoId = videoContainer.dataset.id;
  await fetch(`/api/videos/${videoId}/comment/${commentId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
  // li.remove();
  window.location.reload();
};

deleteBtns.forEach((deleteBtn) => {
  deleteBtn.addEventListener("click", handleDelete);
});
