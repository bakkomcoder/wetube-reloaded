const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");

const handleSubmit = (e) => {
  e.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  const videoId = videoContainer.dataset.id;
  if (text === "") {
    return;
  }
  fetch(`/api/videos/${videoId}/comment`, {
    method: "post",
    // header에 request 정보 담음. express에게 json을 보내고 있다고 알려줌
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }), // request를 보내기 전 프론트에서 string으로 받아 JS object로 변환
  });
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
