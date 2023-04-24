import express from "express";

import {
  getJoin,
  postJoin,
  getLogin,
  postLogin,
} from "../controllers/userController";

import { home, search } from "../controllers/videoController";
import { publicOnlyMiddleware } from "../middlewares";

const rootRouter = express.Router();

rootRouter.get("/", home);
// rootRouter.get("/join", join);
rootRouter.route("/join").all(publicOnlyMiddleware).get(getJoin).post(postJoin);
// rootRouter.get("/login", login);
rootRouter
  .route("/login")
  .all(publicOnlyMiddleware)
  .get(getLogin)
  .post(postLogin);
rootRouter.get("/search", search); // search page에 가면 발생하는 search (컨트롤러)함수

export default rootRouter;

// import express from "express"; // 각 프로젝트는 모두 분리된 모듈이므로 따로 import 해줘야 한다.
// import { join, login } from "../controllers/userController";
// import { trending, search } from "../controllers/videoController";

// const globalRouter = express.Router(); // 라우터를 만들어줌

// // const handleHome = (req, res) => res.send("Home"); // 컨트롤러와 라우터를 구분해야 한다.
// // const handleJoin = (req, res) => res.send("Join");

// globalRouter.get("/", trending); // 라우터가 get request를 받으면 "Home"으로 응답하도록 해야돼! 라고 함수(컨트롤러)를 통해 알려줌
// globalRouter.get("/join", join);
// globalRouter.get("/login", login);
// globalRouter.get("/search", search);

// export default globalRouter; // default로 export 한다는 것은 import 했을 때 내 이름이 상관 없어진다는 뜻.

// // (server.js)임포트 전에 (globalRouter.js)익스포트가 먼저야.
// // 이 스크립트에서 공유하고 싶은 건 globalRouter 뿐이야.
// // 이걸 export default globalRouter; 를 통해 실행 할거야.
// // (server.js) import의 결과는 globalRouter가 될거야. 여기에 이름은 상관없어.
// // 왜냐하면 globalRouter는 이 (const) globalRouter 변수를 디폴트로 익스포트 했거든.
