import express from "express";

import {
  watch,
  getEdit,
  postEdit,
  getUpload,
  postUpload,
  deleteVideo,
} from "../controllers/videoController";
import { protectorMiddleware, videoUpload } from "../middlewares";

const videoRouter = express.Router();

videoRouter.get("/:id([0-9a-f]{24})", watch);
videoRouter
  .route("/:id([0-9a-f]{24})/edit")
  .all(protectorMiddleware)
  .get(getEdit)
  .post(postEdit);
videoRouter
  .route("/:id([0-9a-f]{24})/delete")
  .all(protectorMiddleware)
  .get(deleteVideo);
videoRouter
  .route("/upload")
  .all(protectorMiddleware)
  .get(getUpload)
  .post(videoUpload.single("video"), postUpload);

export default videoRouter;

// import express from "express";
// import { watch, edit } from "../controllers/videoController";

// const videoRouter = express.Router();

// // const handleHome = (req, res) => res.send("Watch Video");
// // const handleEdit = (req, res) => res.send("Edit Video");

// // "/watch", "/edit"는 "/vidoes"라는 공통의 시작부분을 가져.
// videoRouter.get("/watch", watch);
// videoRouter.get("/edit", edit);

// export default videoRouter;
