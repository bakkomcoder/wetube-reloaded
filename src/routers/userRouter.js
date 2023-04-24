import express from "express";

import {
  see,
  logout,
  getEdit,
  postEdit,
  startGithubLogin,
  finishGithubLogin,
  getChangePassword,
  postChangePassword,
} from "../controllers/userController";
import {
  avatarUpload,
  protectorMiddleware,
  publicOnlyMiddleware,
} from "../middlewares";

const userRouter = express.Router();

userRouter.get("/logout", protectorMiddleware, logout);
// userRouter.get("/edit", edit);
// userRouter
//   .route("/edit")
//   .get(protectorMiddleware, getEdit)
//   .post(protectorMiddleware, postEdit);
userRouter
  .route("/edit")
  .all(protectorMiddleware)
  .get(getEdit)
  .post(avatarUpload.single("avatar"), postEdit);
userRouter
  .route("/change-password")
  .all(protectorMiddleware)
  .get(getChangePassword)
  .post(postChangePassword);
// 로그아웃 되어 있어야 실행되도록 함. -> 로그인 돼 있으면 여기로 올 수 없게 보호하는거야.
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);
userRouter.get("/:id", see);

export default userRouter;

// import express from "express";                                  // export default -> 임포트 이름 아무거나 사용할 수 있어. (임포트로 불러와서 아무 이름이나 붙여놓고 사용해도 된다는 뜻이야.)
// import { edit, remove } from "../controllers/userController";   // export => 임포트 이름을 정확히 구체적으로 지정해줘야해.

// const userRouter = express.Router();

// // const handleEdit = (req, res) => res.send("Edit User");
// // const handleDelete = (req, res) => res.send("Delete User");

// // userRouter.get("/edit", handleEdit);        // 이미 server.js에서 특정 경로(/user)에 와서 get request를 보내고 있기 때문에
// // userRouter.get("/delete", handleDelete);    // 내가 /user/edit 라고 입력해주지 않아도 된다.

// userRouter.get("/edit", edit);
// userRouter.get("/delete", remove);

// export default userRouter;

// // userController.js와 다르게 이 스크립트는 문서 하나로 공유해도 돼.
// // 그래서 export default를 쓰는거야!
