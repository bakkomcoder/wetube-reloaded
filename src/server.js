// console.log(process.env.DB_URL, process.env.COOKIE_SECRET);
// require("dotenv").config();
// console.log(process.env.DB_URL, process.env.COOKIE_SECRET);
import express from "express";
import morgan from "morgan";
import session from "express-session"; // 사이트로 들어오는 모두를 기억하는 미들웨어
import MongoStore from "connect-mongo";

import rootRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import { localsMiddleware } from "./middlewares";

const app = express();
const logger = morgan("tiny");

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use(logger);
app.use(express.urlencoded({ extended: true }));

// express-session 모듈로부터 주어진 미들웨어 -> 하는 일: 브라우저가 backend와 상호작용 할 때마다
app.use(
  session({
    // 이 session라는 미들웨어가 브라우저에 cookie를 전송한다.
    secret: process.env.COOKIE_SECRET,
    resave: true,
    saveUninitialized: false,
    // cookie: {
    //   maxAge: 10000,
    // },
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
  })
);

app.use(localsMiddleware);
app.use("/uploads", express.static("uploads"));
app.use("/", rootRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);

export default app;

// // *** 3/9 목요일 ***
// // express-session: 라우터 앞에 작성해야 함.
// app.use(
//   session({
//     secret: "Hello!",
//     resave: true,
//     saveUninitialized: true,
//   })
// );
// // Value
// // s%3A70hWXCZTmH2s0IPlvDj5mqOo6paTIIaZ.ZQ8d9ymu5fWWWHp%2B8n88gOd7DYWcGSbX8XUxkwXK3Pw

// // 쿠키가 어떻게 나오는지 보자.
// app.use((req, res, next) => {
//   console.log(req.headers);
//   next();
// });
// // cookie: 'connect.sid=s%3ATZKU-UvDAXncFJmIy0YhVQYhQ9cPgdKi.iBMc7L4SjtpizBGNTALKPRcT9CxqFc3dUHuQwvhkSxI',
// // 'if-none-match': 'W/"3b0-rc7kMz7KAPFOH2DapaiheRNlYnk"'

// // 이 텍스트의 내용이 뭘까?
// // locals object 추가하는 법
// app.use((req, res, next) => {
//   res.locals.hobby = "swimming"; // hobby라는 object를 추가함.
//   //   res.locals.siteName = "Wetube";
//   req.sessionStore.all((error, sessions) => {
//     console.log(sessions); // 백엔드에 저장되어 있는 모든 session(유저 정보)를 보고싶지 않아서 지워줄게!
//     next();
//   });
// });
// // 백엔드가 기억하고 있는 세션(유저)을 보여줌
// // {
// //     PcJjAmvHuhMGJFgv6Nb9CFoXZp_Z7YUO: {
// //       cookie: { originalMaxAge: null, expires: null, httpOnly: true, path: '/' }
// //     }
// //   }
// app.use(localsMiddleware);
// app.use("/", rootRouter);
// app.use("/users", userRouter);
// app.use("/videos", videoRouter);

// export default app;

// **** 완전 과거 ****
// import express from "express";

// const PORT = 4000;

// const app = express();

// // 1. route가 없는 코드 -> cannot GET / (home(/)에 갈 수 없어요!)
// // 기본적으로 사용자가 원하는 걸 요청할 때, 브라우저가 get request를 보낸다.
// // get request에는 route가 있어서 사용자가 어디로 가는지, 가려고 하는지 알아야 한다.
// // 아래의 코드는 route가 없다. 로그인으로 갈 건지 /login, 프로필로 갈 건지? /profile
// // 그래서 이런 에러 메시지가 발생한다. ===>> "cannot get /"

// const handleListening = () => console.log("Server listening on port 4000 🚀");

// app.listen(PORT, handleListening);

// // 2. 브라우저가 로딩만 되는 현상
// // 이제는 request를 받고 처리까지는 하는데, 아직 응답을 안하고 있다.
// // 브라우저가 너의 서버에 무언가를 request한다.
// // request를 하는 방법 중 하나는, url에게 get request를 보내는 거야.

// const handleHome = () => console.log("Somebody is trying to go home.");

// app.get("/", handleHome); // 이 경우는, 이게(/) home url이야.

// const handleListening = () => console.log(`✅ Server listening on port http://localhost:${PORT} 🚀`)

// app.listen(PORT, handleListening);

// // 3.1 서버에 무엇을 응답해야 하는지 알려줬다. return res.send()

// const handleHome = (req, res) => {
//     // return res.end();
//     return res.send("I still love you.");
// }
// const handleLogin = (req, res) => {
//     return res.send("Login here.");
// }
// app.get("/", handleHome);
// app.get("/login", handleLogin);

// const handleListening = () => console.log(
//     `✅ Server listening on port http://localhost:${PORT} 🚀`)

// app.listen(PORT, handleListening);

// // 3.2 controller: express로부터 주어지는 request와 respond를 함수에 주는거야.

// const home = (req, res) => res.send("hello");
// app.get("/", home);

// const handleListening = () => console.log(
//     `✅ Server listening on port http://localhost:${PORT} 🚀`);

// app.listen(PORT, handleListening);

// // 4.1 middleware
// const logger = (req, res, next) => {
//     console.log(`${req.method} ${req.url}`);    // (2)request에 관한 모든 정보를 가지고 있는, request object를 이용해서!
//     next();
// }

// const privateMiddleware = (req, res, next) => {
//     const url = req.url;
//     if(url === "/protected") {                  // (3)'/protected'를 감지하면 중간에 개입해서 다음 함수를 호출하는 걸 막고,
//         return res.send("<h1>Not Allowed</h1>");
//     }
//     next();                                     // (4)url이 '/protected'가 아니라면 다음 함수를 호출하지.
// }

// const handleHome = (req, res) => {
//     return res.send("I love middlewares");
// };

// const handleProtected = (req, res) => {
//     return res.sed("Welcome to the privated lounge.");
// }

// app.use(logger);                // (1)logger middleware는 application 전체에서 사용되고 있고, method와 url을 console.log 해줘.
// app.use(privateMiddleware);     // /protected를 감지하면 중간에 개입해서 다음 함수를 호출하는 걸 막고,
// app.get("/", handleHome);
// app.get("/protected", handleProtected);

// const handleListening = () => console.log(
//     `✅ Server listening on port http://localhost:${PORT} 🚀`);

// app.listen(PORT, handleListening);

// // 4.2 middleware

// const routerLogger = (req, res, next) => {
//     console.log("PATH", req.path);
//     next();
// };

// const methodLogger = (req, res, next) => {
//     console.log("METHOD", req.method);
//     next();
// };

// const home = (req, res) => {
//     console.log("I will respond.")
//     return res.send("hello");
// }

// const login = (req, res) => {
//     return res.send("login");
// }
//     // 브라우저가 뭔가를 요청하고 있다고 상상해봐.
// app.use(methodLogger, routerLogger);    // 우선 middleware를 사용해야지. 둘 다 next함수가 있어.
// app.get("/", home);                     // home으로 가는 거라면 home 실행
// app.get("/login", login);               // Home으로 가는 게 아닌걸로 확인되면, login이라면 login 실행
// // app.get("/", methodLogger, routerLogger, home);

// const handleListening = () => console.log(
//     `✅ Server listening on port http://localhost:${PORT} 🚀`);

// app.listen(PORT, handleListening);

// // 6. middleware - morgan

// import morgan from "morgan";

// const logger = morgan("tiny");

// const home = (req, res) => {
//     console.log("I will respond.")
//     return res.send("hello");
// }

// const login = (req, res) => {
//     return res.send("login");
// }

// app.use(logger); // morgan은 GET, path, status code, 이 모든 정보를 가지고 있다.
// app.get("/", home);
// app.get("/login", login);

// const handleListening = () => console.log(
//     `✅ Server listening on port http://localhost:${PORT} 🚀`);

// app.listen(PORT, handleListening);

// // 과제2 : middleware 4개(url, time, secure, protected) 만들기

// import express from "express";

// const app = express();

// const URLLogger = (req, res, next) => {
//     console.log(`PATH: ${req.path}`);
//     next();
// };

// const TIMELogger = (req, res, next) => {
//     const now = new Date();
//     const year = now.getFullYear();
//     const month = now.getMonth();
//     const day = now.getDate();
//     console.log(`TIME: ${year}:${month}:${day}`);
//     next();
// };

// const SECURITYLogger = (req, res, next) => {
//     if (req.protocol === "https") {
//     console.log("Secure");
//     } else {
//     console.log("Insecure");
//     }
//     next();
// };

// const PROTECTLogger = (req, res, next) => {
//     const url = req.url;
//     if (url === "/protected") {
//         return res.send("<h1>Not Allowed</h1>");
//     } else {
//         return res.send("<h1>Allowed</h1>");
//     }
//     next();
// };

// app.use(URLLogger, TIMELogger, SECURITYLogger, PROTECTLogger);

// app.get("/", (req, res) => res.send("<h1>Home</h1>"));
// app.get("/protected", (req, res) => res.send("<h1>Protected</h1>"));

// app.listen(PORT, () => console.log(`✅ Server listening on port http://localhost:${PORT} 🚀`));

// // (2/16목) Router

// import express from "express";
// import morgan from "morgan";

// const PORT = 4000;

// const app = express();
// const logger = morgan("tiny");
// app.use(logger);

// const globalRouter = express.Router();
// const handleHome = (req, res) => res.send("Home");
// globalRouter.get("/", handleHome);

// const userRouter = express.Router();
// const handleEditUser = (req, res) => res.send("Edit User");
// userRouter.get("/edit", handleEditUser);

// const videoRouter = express.Router();
// const handleWatchVideo = (req, res) => res.send("Watch Video");
// videoRouter.get("/watch", handleWatchVideo);

// app.use("/", globalRouter);
// app.use("/users", userRouter);
// app.use("/videos", videoRouter);

// app.listen(PORT, () => console.log(`✅ Server listening on port http://localhost:${PORT} 🚀`));
