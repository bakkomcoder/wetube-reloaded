// 비디오 파일의 데이터 형식을 정의
import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 80 },
  fileUrl: { type: String, required: true }, // (3.23목) file url 추가
  description: { type: String, required: true, trim: true, minlength: 20 },
  createdAt: { type: Date, required: true, default: Date.now },
  hashtags: [{ type: String, trim: true }],
  meta: {
    views: { type: Number, default: 0, required: true },
    rating: { type: Number, default: 0, required: true },
  },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
}); // (3.23목) ObjectId는 "User" 모델에서 온다고 mongoose에게 알려주는게 중요해

videoSchema.static("formatHashtags", function (hashtags) {
  return hashtags
    .split(",")
    .map((word) => (word.startsWith("#") ? word : `#${word}`));
});

const Video = mongoose.model("Video", videoSchema);
export default Video;

// // #6.23 middleware
// videoSchema.pre("save", async function () {
//   this.hashtags = this.hashtags[0]
//     .split(",")
//     .map((word) => (word.startsWith("#") ? word : `#${word}`));
//   // console.log(this);
//   // console.log("We are about to save: ", this); // 작동하는 걸 확인 했으니 원한다면 이것저것 바꿔볼 수 있어
//   // this.title = "Hahaha! Im a middleware!!!";
// });

// #6.24 function
// export const formatHashtags = (hashtags) =>
//   hashtags.split(",").map((word) => (word.startsWith("#") ? word : `#${word}`));

// #6.24 Static // 함수명 ==> 을 지어서 직접 함수를 작성한다.
// videoSchema.static("formatHashtags", function (hashtags) {
//   return hashtags
//     .split(",")
//     .map((word) => (word.startsWith("#") ? word : `#${word}`));
// });
// // Video.findById, Video.exist 등등을 쓸 수 있듯, Video.formatHashtags를 쓸 수 있다.
// // Video만 import 하면 formatHashtags도 딸려온다.

// const Video = mongoose.model("Video", videoSchema);
// export default Video;

// 해당 형식을 가진 model을 만듦
// const movieModel = mongoose.model("Video", videoSchema);
// export default movieModel;

// 해당 modeldmf default로 export 한 뒤 server.js에서 import 해서 preload를 가능하게 만들었어.
// import "./db";
// import "./models/Video";
// model을 미리 complie 또는 create 해야, 우리가 필요할 때 해당 model을 사용할 수 있어서 이렇게 하는거야.
// 앞으로 우리는 정말 많은 모델을 불러오게 될거야. 그래서 init.js와 server.js로 분리시켜 주었어!
