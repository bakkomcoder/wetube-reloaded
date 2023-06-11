const avatar = document.querySelector(".avatarImg");
const input = document.getElementById("avatar");

input.addEventListener("change", () => {
  if (input.files && input.files[0]) {
    // 파일이 존재하면
    const reader = new FileReader(); // 브라우저에서 파일 읽는 reader 생성
    reader.onload = (e) => {
      avatar.src = e.target.result;
    };
    reader.readAsDataURL(input.files[0]);
  }
});
