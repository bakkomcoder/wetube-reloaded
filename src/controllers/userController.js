import User from "../models/User";
import Video from "../models/Video";
import fetch from "node-fetch";
import bcrypt from "bcrypt";

export const getJoin = (req, res) =>
  res.render("user/join", { pageTitle: "회원가입" });

export const postJoin = async (req, res) => {
  const { username, email, password, password2 } = req.body;
  const pageTitle = "회원가입";
  if (password !== password2) {
    return res.status(400).render("user/join", {
      pageTitle,
      errorMessage: "비밀번호가 일치하지 않아요 🥲",
    });
  }
  const exists = await User.exists({
    $or: [{ username: req.body.username }, { email }],
  });
  if (exists) {
    return res.status(400).render("user/join", {
      pageTitle,
      errorMessage: "이미 있는 이름/이메일이에요 🥲",
    });
  }
  await User.create({
    email,
    username,
    password,
    avatarUrl: "static/img/defaultAvatar.png",
  });
  req.flash("success", "회원가입 완료! 로그인 화면으로 이동합니다.");
  return res.redirect("/login");
};

export const getLogin = (req, res) =>
  res.render("user/login", { pageTitle: "로그인" });

export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const pageTitle = "로그인";
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).render("user/login", {
      pageTitle,
      errorMessage: "존재하지 않는 계정이에요 🥲",
    });
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).render("user/login", {
      pageTitle,
      errorMessage: "잘못된 비밀번호에요 🥲",
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  req.flash("success", `${username}님, 환영해요!`);
  return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      return res.redirect("/login");
    }
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      user = await User.create({
        avatarUrl: userData.avatar_url,
        email: emailObj.email,
        username: userData.login,
        password: "",
        socialOnly: true,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};

export const getEdit = (req, res) => {
  return res.render("user/edit-profile", { pageTitle: "프로필 수정" });
};
export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id, avatarUrl },
    },
    body: { email, username },
    file,
  } = req;
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? file.path : avatarUrl,
      email,
      username,
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
  return res.render("user/change-password", { pageTitle: "비밀번호 변경" });
};
export const postChangePassword = async (req, res) => {
  const pageTitle = "비밀번호 변경";
  const {
    session: {
      user: { _id, password },
    },
    body: { oldPassword, newPassword, newPasswordConfirmation },
  } = req;
  const user = await User.findById(_id);
  const ok = await bcrypt.compare(oldPassword, password);
  if (!ok) {
    return res.status(400).render("user/change-password", {
      pageTitle,
      errorMessage: "잘못된 비밀번호에요 🥲",
    });
  }
  if (newPassword !== newPasswordConfirmation) {
    return res.status(400).render("user/change-password", {
      pageTitle,
      errorMessage: "비밀번호가 일치하지 않아요 🥲",
    });
  }
  user.password = newPassword;
  await user.save();
  req.session.user.password = user.password;
  return res.redirect("/logout");
};

export const see = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate({
    path: "videos",
    populate: {
      path: "owner",
      model: "User",
    },
  });
  console.log("USER", user);
  if (!user) {
    return res.status(404).render("404", { pageTitle: "사용자가 없어요 🥲" });
  }
  return res.render("user/profile", {
    pageTitle: user.username,
    user,
  });
};
