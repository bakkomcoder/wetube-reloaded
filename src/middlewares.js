import multer from "multer";

export const localsMiddleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteName = "Wetube";
  res.locals.loggedInUser = req.session.user || {};
  // console.log(req.session.user);
  next();
};
//   if (req.session.loggedIn) { // req.sesstion.loggedIn = true라면 (if문 안에는 true/false 질문이다. 기본이 true)
//     res.locals.loggedIn = true; // 요청이 들어왔는데 로그인 되어있다면(req.session.loggedIn=true) 응답도 true
//   } // 이를 짧게 쓴다면
// console.log(req.sessionID);
// res.locals.loggedIn = Boolean(req.session.loggedIn); // 이렇게 된다.
// res.locals.siteName = "Wetube";
//   console.log(res.locals);  // 로그인 되어있을 경우, { loggedIn: true, siteName: 'Wetube' }
// 왜? userController에서 선행 조건을 갖추면 ....  req.session.loggedIn = true; req.session.user = user; 라고 설정해 놓았기 때문이다.
//    res.locals.loggedInUser = req.session.user;
//   next();
// };

export const protectorMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    // user가 loggedIn 돼 있다면
    return next(); // 요청을 계속하게 되고
  } else {
    // loggedIn 돼 있지 않으면
    return res.redirect("/login"); // 로그인 페이지로 redirect 해줄거야
  }
};

// 로그아웃 되어 있어야 실행되도록 함. -> 로그인 돼 있으면 여기로 올 수 없게 보호하는거야.
export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    // user가 loggedIn 돼 있지 않으면
    return next(); // 요청을 계속하게 하고
  } else {
    // loggedIn 돼 있으면
    return res.redirect("/"); // "/"(home)으로 redirect 해줘.
  }
};

// 사용자가 보낸 파일을 uploads 폴더에 저장하도록 설정된 middleware
// export const uploadFiles = multer({ dest: "uploads/" });

export const avatarUpload = multer({
  dest: "uploads/avatars/",
  limits: { fileSize: 3000000 },
});

export const videoUpload = multer({
  dest: "uploads/videos/",
  limits: { fileSize: 3000000 },
});
