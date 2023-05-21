const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const muteBtn = document.getElementById("mute");
const volumeRange = document.getElementById("volume");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");

let controlsTimeout = null;
let controlsMovementTimeout = null;
let volumeValue = 0.5;
video.volume = volumeValue;

const handlePlayClick = () => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  playBtn.innerText = video.paused ? "플레이" : "정지";
};

const handleMuteClick = () => {
  if (video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }
  muteBtn.innerText = video.muted ? "음소거 해제" : "음소거";
  volumeRange.value = video.muted ? 0 : volumeValue;
};

const handleVolumeChange = (event) => {
  const {
    target: { value },
  } = event;
  if (video.muted) {
    video.muted = false;
    muteBtn.innerText = "Mute";
  }
  volumeValue = value;
  video.volume = value;
};

const formatTime = (seconds) =>
  new Date(seconds * 1000).toISOString().substr(11, 8);

const handleLoadedMetadata = () => {
  totalTime.innerText = formatTime(Math.floor(video.duration));
  timeline.max = Math.floor(video.duration);
};

const handleTimeUpdate = () => {
  currentTime.innerText = formatTime(Math.floor(video.currentTime));
  timeline.value = Math.floor(video.currentTime);
};

const handleTimelineChange = (event) => {
  const {
    target: { value },
  } = event;
  video.currentTime = value;
};

const handleFullscreen = () => {
  const fullscreen = document.fullscreenElement;
  // console.log(fullscreen); // 전체화면 아닐 때 null, 전체화면 일 때 div#videoContainer 요소 반환
  if (fullscreen) {
    document.exitFullscreen();
    fullScreenBtn.innerText = "전체화면";
  } else {
    videoContainer.requestFullscreen();
    fullScreenBtn.innerText = "전체화면 나가기";
  }
};

const hideControls = () => videoControls.classList.remove("showing");

const handleMouseMove = () => {
  // (3) 사용자가 비디오에 들어왔다 떠나서 다시 들어올 때 발생 => controlsTimeout이 number가 되서 Timeout을 취소할 수 있게 되었다.
  if (controlsTimeout) {
    clearTimeout(controlsTimeout);
    controlsTimeout = null;
  }
  // (5) (취소) 사용자의 마우스가 움직이지 않는 것을 파악 -> 움직일 때 Timeout 취소
  if (controlsMovementTimeout) {
    clearTimeout(controlsMovementTimeout);
    controlsMovementTimeout = null;
  }
  // (1) 처음 사용자가 비디오에 들어왔을 때 -> 3초 기다렸다가 컨트롤러 삭제
  videoControls.classList.add("showing");
  controlsMovementTimeout = setTimeout(hideControls, 3000); // (4) (생성) 사용자가 움직임을 멈추면 취소할 수 없는 Timeout을 만든다
};

const handleMouseLeave = () => {
  // (2) 사용자가 비디오를 떠나면 컨트롤을 숨겨주는 timeout 생성 (controlsTimeout이 null에서 numbers로 변환됌)
  controlsTimeout = setTimeout(hideControls, 3000);
};

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMuteClick);
volumeRange.addEventListener("input", handleVolumeChange);
video.addEventListener("loadeddata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
timeline.addEventListener("input", handleTimelineChange);
fullScreenBtn.addEventListener("click", handleFullscreen);
video.addEventListener("mousemove", handleMouseMove);
video.addEventListener("mouseleave", handleMouseLeave);
