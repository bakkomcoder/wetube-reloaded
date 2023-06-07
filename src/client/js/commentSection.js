const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");

const handleSubmit = (e) => {
  e.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  const videoId = videoContainer.dataset.id;
  console.log(videoId);
  console.log(text);
  fetch(`/api/videos/${videoId}/comment`, {
    method: "post",
    body: { text },
  });
  console.log("fetch");
};

if (form) {
  form.addEventListener("submit", handleSubmit);
}

// const videoContainer = document.getElementById("videoContainer");
// const form = document.getElementById("commentForm");

// const addComment = (text) => {
//   const videoComments = document.querySelector(".video__comments ul");
//   const newComment = document.createElement("li");
//   newComment.className = "video__comment";
//   const icon = document.createElement("i");
//   icon.className = "fas fa-comment";
//   const span = document.createElement("span");
//   span.innerText = ` ${text}`;
//   newComment.appendChild(icon);
//   newComment.appendChild(span);
//   videoComments.prepend(newComment);
// };

// const handleSubmit = async (event) => {
//   event.preventDefault();
//   const textarea = form.querySelector("textarea");
//   const text = textarea.value;
//   const videoId = videoContainer.dataset.id;
//   if (text === "") {
//     return;
//   }
//   fetch(`/api/videos/${videoId}/comment`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ text }),
//   });
//   textarea.value = "";
// };

// if (form) {
//   form.addEventListener("submit", handleSubmit);
// }
