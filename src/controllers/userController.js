import User from "../models/User";
import Video from "../models/Video";
import fetch from "node-fetch";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });
export const postJoin = async (req, res) => {
  // 입력한 데이터 출력해보기
  // console.log(req.body);
  // res.end();
  const { name, email, username, password, password2, location } = req.body;
  const pageTitle = "Join";
  if (password !== password2) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "Password confirmation does not match.",
    });
  }
  //   const usernameExists = await User.exists({ username });
  //   if (usernameExists) {
  //     return res.render("join", {
  //       pageTitle,
  //       errorMessage: "This username is already taken.",
  //     });
  //   } // 이렇게 하게 되면 emailExists 를 중복으로 만들어줘야 한다. -> or 연산자를 사용하자!
  const exists = await User.exists({
    $or: [{ username: req.body.username }, { email }],
  });
  if (exists) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "This username/email is already taken.",
    });
  }
  await User.create({
    // 입력한 데이터 DB에 저장: mongoose 기능 활용, Model.create({전달할 데이터})
    name,
    email,
    username,
    password,
    location,
  });
  return res.redirect("/login");
};

// 3월 7일 화요일
export const getLogin = (req, res) =>
  res.render("login", { pageTitle: "Login" });

// POST request를 받으면 할 것들 정리
export const postLogin = async (req, res) => {
  // (1) check if account exist
  const { username, password } = req.body;
  const pageTitle = "Login";
  const user = await User.findOne({ username }); // (1)과 (2)에서 겹치므로 하나로 해결!
  // const exists = await User.exists({ username });
  // if (!exists) {
  if (!user) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "An account with this username does not exitst.",
    });
  }
  // (2) check if password correct
  // console.log(user.password);
  const ok = await bcrypt.compare(password, user.password); // compare(plain, hashed)
  if (!ok) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "Wrong password",
    });
  }
  // (3/18 토) 세션에 정보를 추가
  req.session.loggedIn = true;
  req.session.user = user; // DB에서 찾은 user <- await User.findOne({username})
  return res.redirect("/");
  // res.end();
};

export const startGithubLogin = (req, res) => {
  // finalUrl -> 이렇게 !! "https://github.com/login/oauth/authorize?client_id=1dd9a4c62bb67bfc4c9f";
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email", // (3/17 금) 모든 건 scope에서 출발해. 여기서 access_token이 볼 수 있게끔 허락해줬기 때문에 서로 다른 두개의 데이터를 받아볼 수 있게 작동하는 거야.
  };
  // console.log(process.env.GH_CLIENT);
  const params = new URLSearchParams(config).toString();
  // 깃허브가 원하는 형태는 toString() 해줘야 한다.
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  // 이 URL은 다음과 같은 것들을 포함하고 있고, 이 값들에 접근하기 위해 환경 변수를 사용하고 있어. (process.env) 코드를 매번 복붙 할 필요 없어, 코드에서 알아서 잘 숨겨줄거야.(.env 파일)
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code, // URL에 보이는 code
  };
  // console.log(config);
  const params = new URLSearchParams(config).toString(); // config를 URL로 바꿔주기
  const finalUrl = `${baseUrl}?${params}`;
  // 이 경우에는 redirect 시키진 않을거야. 우린 어디에도 가지 않아. 그냥 POST request를 보내기만 할거야.
  // *** 우리가 만든 URL에 fetch를 사용해서 POST request를 보내는 과정!!!
  const tokenRequest = await (
    await fetch(finalUrl, {
      // fetch ~ then ~ 이게 문법인데, 나는 await fetch를 한 다음에 JSON을 가져오는 것을 선호하는 편이야.
      // finalUrl에 POST 요청을 보낼거야. 우선 fetch를 통해 데이터를 받아오고
      method: "POST",
      headers: {
        Accept: "application/json", // JSON을 return 받기 위해서 이걸 보내야 한다는 걸 잊지마. (보내지 않으면 github이 text로 응답할거야!)
      }, // header 안에 붙여주고 {} 괄호를 사용해 string으로 바꿔줬어.
    })
  ).json();
  // const json = await data.json(); // 그 데이터에서 JSON을 추출할거야.
  // console.log(json);
  // res.send(JSON.stringify(json));
  // ---------------------------------
  // response 안에 access_token이 없다면 우린 login으로 redirect돼.
  // 3단계 : 이 GET URL을 통해서 인증을 위한 access_token을 보내줘야해.
  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest; // JSON 안에 있는 access_token을 쓸거야. // (3/17 금) access_token이 볼 수 있게끔 허락해줬기 때문에 작동하는 거야.
    // (*정리*) 여기 우리가 만든 두 개의 request가 있지. (userData, emailData)
    // (*정리*) 서로 다른 데이터에 접근할 수 있는 같은 토큰을 사용하고 있지.
    const apiUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`, // token이란 string을 넣어서(깃헙 매뉴얼), access_token을 fetch 안의 header로 보내자.
        },
      })
    ).json();
    // console.log(userData); // 오예!! 콘솔 창에 깃헙 프로필 정보를 가져왔어!! 이제 이걸 사용하기만 하면 돼.
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`, // token이란 string을 넣어서(깃헙 매뉴얼), access_token을 fetch 안의 header로 보내자.
        },
      })
    ).json();
    // console.log(emailData); // (3/17 금) 두 개의 다른 데이터를 받고 있어. access_token이 볼 수 있게끔 허락해줬기 때문에 작동하는 거야.
    // const emails = [
    //   {
    //     email: 'seoy1108@gmail.com',
    //     primary: true,
    //     verified: true,
    //     visibility: 'private'
    //   },
    //   {
    //     email: '79674766+bakkomcoder@users.noreply.github.com',
    //     primary: false,
    //     verified: true,
    //     visibility: null
    //   }
    // ]
    // emails.find(email => email.primary === true && email.verified === true)
    // ********* (3/17 금 - 로그인 구현 마무리!) code 섹시하게
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      // set notification (유저한테 Github로 로그인 했다는 걸 알려주기 위해서)
      return res.redirect("/login");
    }
    let user = await User.findOne({ email: emailObj.email }); // 유저가 있다면 if문은 스킵하고
    if (!user) {
      // 만일 user를 못 찾았다면 user를 새로 만든 user로 정의할거야.
      user = await User.create({
        // (*정리*) 여기 있는 모든 데이터는 userData로부터 오고
        // (*정리*) userData는 API로부터 오며, emailData 또한 Github API로부터 온다.
        avatarUrl: userData.avatar_url, // avatarUrl이 없는 user는 email과 password로만 계정을 만들었단 소리야.
        name: userData.name,
        email: emailObj.email,
        username: userData.login,
        password: "",
        socialOnly: true,
        location: userData.location,
      });
    } // 여기서 user를 로그인 시킬거야.
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};
//     // (1.1) 데이터베이스에 해당 email을 가진 user가 없을 때
//     const existingUser = await User.findOne({ email: emailObj.email }); // emailObj list 안에 email 객체를 찾고
//     if (existingUser) {
//       // 존재한다면 (즉, primay=true, verified=true 한 계정 이메일과 같다면) 로그인 시켜준다.
//       req.session.loggedIn = true;
//       req.session.user = existingUser;
//       return res.redirect("/");
//       // 이 if문이 실행될거야. 왜? 해당 email을 가지고 있는 user가 이미 데이터베이스에 있고, Github이 API에서 해당 email을 주기 때문이지.
//       // 만일 계정이 없다면 어떻게 될 것인가? mongo 터미널에 db.users.remove({}) <- 입력하면 내 계정이 삭제되는데, 그럼 이 코드가 실행되지 않을거야.
//       // 우린 이제 user를 생성해야돼. else 문으로 가자.
//     } else {
//       // create an account // 해당 email로 user가 없으니까 계정을 생성한다.
//       const user = await User.create({
//         // 입력한 데이터 DB에 저장: mongoose 기능 활용, Model.create({전달할 데이터})
//         name: userData.name,
//         email: emailObj.email,
//         username: userData.login,
//         password: "", // Github을 이용해 계정을 만들었다면 Password는 없겠지. 그렇다면 username과 password form을 사용할 수 없어.
//         // 그래서 너희 계정이 User model -> socialOnly = true라는 걸 알려줘야 해. (default: false)
//         socialOnly: true,
//         location: userData.location,
//       }); // (1.2) 이렇게 Password 없이 Github의 데이터로 user를 생성하고, 그런 user에게는 socialOnly: true 값을 주고 있다.
//       // (1.3) 이건 postLogin에서 유용하게 쓰일거야. password가 없으니 Github로 로그인 해! 아니면 password를 새로 생성하는 페이지를 만들든지.
//       req.session.loggedIn = true;
//       req.session.user = user;
//       return res.redirect("/");
//     }
//   } else {
//     return res.redirect("/login");
//   }
// };
// ************ code 섹시하게

//   const tokenRequest = await (
//     await fetch(finalUrl, {
//       method: "POST",
//       headers: {
//         Accept: "application/json",
//       },
//     })
//   ).json();
//   if ("access_token" in tokenRequest) {
//     // access api
//     const { access_token } = tokenRequest;
//     const userRequest = await (
//       await fetch("https://api.github.com/user", {
//         headers: {
//           Authorization: `token ${access_token}`,
//         },
//       })
//     ).json();
//     console.log(userRequest);
//   } else {
//     return res.redirect("/login");
//   }
// };

export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};

export const getEdit = (req, res) => {
  return res.render("edit-profile", { pageTitle: "Edit Profile" });
};
export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id, avatarUrl },
    },
    body: { name, email, username, location },
    file,
  } = req;
  // const exists = await User.exists({
  //   $or: [{ username }, { email }],
  // });
  // if (exists) {
  //   return res.status(400).render("edit-profile", {
  //     pageTitle: "Edit Profile",
  //     errorMessage: "This username/email is already taken.",
  //   });
  // }
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? file.path : avatarUrl,
      name,
      email,
      username,
      location,
    },
    { new: true }
  );
  req.session.user = updatedUser;
  return res.redirect("/users/edit");
};

export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly === true) {
    return res.redirect("/");
  }
  return res.render("users/change-password", { pageTitle: "Change Password" });
};
export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id, password },
    },
    body: { oldPassword, newPassword, newPasswordConfirmation },
  } = req;
  const user = await User.findById(_id); // 혹은, 업데이트 한 user를 사용하는 방법도 있다.
  const ok = await bcrypt.compare(oldPassword, password); // compare(old-pw, form에 입력한 Pw)
  if (!ok) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The current password is incorrect",
    });
  }
  // step1. password가 같은지 확인 // 브라우저는 맞게 한 줄 알아. (username과 pw 저장할건지 물어봄) -> status(400)을 주면 안 물어본다.
  if (newPassword !== newPasswordConfirmation) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The password does not match the confirmation",
    });
  }
  // pre save middleware가 비밀번호를 hash한다.
  // session에서 user를 찾아 save() 함수 쓰면 pre save가 작동하고 비밀번호가 hash 된다.
  // const user = await User.findById(_id); // (change-pw 마지막!!3) 혹은, 업데이트 한 user를 사용하는 방법도 있다.
  console.log("Old Password", user.password);
  user.password = newPassword;
  console.log("New Unhashed Password", user.password);
  await user.save(); // DB에 저장하는 데 시간이 오래 걸리니까 await
  console.log("New Password", user.password);
  req.session.user.password = user.password; // (change-pw 마지막!!2) 세션을 업데이트 해야한다. (session에 있는 hash된 비밀번호가 기존 비밀번호와 일치하는지 확인하고 있기 때문에)
  // send notification
  return res.redirect("/users/logout"); // (change-pw 마지막!!1) submit 버튼 누르면 logout 되도록 할건데,
};

// (3.23목) video owner & user profile
export const see = async (req, res) => {
  const { id } = req.params; // public 공개 페이지여야 하므로 user session이 아니라 URL에서 user의 id를 가져왔다.
  const user = await User.findById(id).populate({
    path: "videos",
    populate: {
      path: "owner",
      model: "User",
    },
  }); // id를 가지고 User 모델에 있는 user를 찾을거야.
  // 만약 user가 없다면
  if (!user) {
    return res.status(404).render("404", { pageTitle: "User not found." }); // status code? 브라우저가 자동적으로 username과 pw 저장하는 기능 막음
  }
  // (user profile) : watch 템플릿에서 #{owner.name} 링크 타고 들어오면 보여주는 화면. 비디오가 있어야겠지!
  // const videos = await Video.find({ owner: user._id }); // 영상 소유자의 'id'와 'params'의 'id'가 같은 모든 영상들을 찾음
  // console.log(videos);
  return res.render("users/profile", {
    pageTitle: user.name,
    user, // videos array를 템플릿에 보냄. (user profile 정리) user와 owner의 id가 같은 'video'들을 찾고 있어. 이것만 해도 충분히 대단해. template(render 하고 있는 /users/profile.pug 파일)로 videos를 보낼 수 있다는거니까!
  }); // 정보를 받아 'db'를 검색하고 'render'하는 작업은 이제 거의 다 끝났어!
}; // 이 video를 어떻게 user와 연결시킬 수 있을까?

// export const join = (req, res) => res.send("Join");
// // const handleEdit = (req, res) => res.send("Edit User");
// // const handleDelete = (req, res) => res.send("Delete User");
// export const edit = (req, res) => res.send("Edit User");
// export const remove = (req, res) => res.send("Remove User");
// export const login = (req, res) => res.send("Login");

// // 나는 이 세 함수를 바깥과 공유하고 싶거든?
// // export default를 사용하면 한 가지밖에 공유할 수 없어. (문서 하나로 공유된다.)
// // 때문에 각각의 함수에 export를 달아줬어. 하나 이상을 공유할 수 있어.

// // 이렇게 임포트 할 수 있어!
// // import { edit, remove } from "../userController.js"
// //            => object 를 열어서 사용하지.
