import Video from "../models/Video";
import User from "../models/User";

export const home = async (req, res) => {
  const videos = await Video.find({}).sort({ createdAt: "desc" });
  // console.log(videos);
  return res.render("home", { pageTitle: "Home", videos });
};

export const watch = async (req, res) => {
  const { id } = req.params;
  // (3.23목) populate("owner")를 사용하면 'owner object' 전체가 불려진다!!!!!
  const video = await Video.findById(id).populate("owner");
  // 방법1. video.owner와 loggedInUser._id는 같다. owner를 watch template으로 보내주자.
  // const video = await Video.findById(id);
  const owner = await User.findById(video.owner); // video를 찾고 owner를 찾아.
  if (!video) {
    return res.render("404", { pageTitle: "Video not found." });
  }
  return res.render("watch", { pageTitle: video.title, video, owner });
};

export const getEdit = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.render("404", { pageTitle: "Video not found." });
  }
  return res.render("edit", { pageTitle: `Edit: ${video.title}`, video });
};

export const postEdit = async (req, res) => {
  const { id } = req.params;
  const { title, description, hashtags } = req.body;
  const video = await Video.exist({ _id: id });
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) => {
  // (3.23목)
  const {
    user: { _id },
  } = req.session;
  // const {path} = req.file // (3.23목) multer는 req.file을 제공해주는데
  const { path: fileUrl } = req.file;
  const { title, description, hashtags } = req.body;
  try {
    await Video.create({
      title,
      description,
      // fileUrl: path // (3.23목) file 안에 path가 있어. // 하지만 아직 Video 안에 fileUrl을 만들지 않았어.
      fileUrl,
      owner: _id,
      hashtags: Video.formatHashtags(hashtags),
    });
    // (3.24금) video 업로드 할 때마다 array에 넣어서
    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    user.save();
    return res.redirect("/");
  } catch (error) {
    return res.status(404).render("upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  await Video.findByIdAndDelete(id);
  return res.redirect("/");
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    videos = await Video.find({
      title: {
        $regex: new RegExp(keyword, "i"),
      },
    });
  }
  res.render("search", { pageTitle: "Search", videos });
};

// // gloabalRouter.js 는 안 만든다! 왜?
// // /, /join 두 가지가 어디에 포함되는지 아니까.
// // / => videoController
// // /join => userController

// // const handleHome
// // const homepageVideos
// // const trendingVideos
// export const trending = (req, res) => res.send("Home Page Videos");
// //const handleHome = (req, res) => res.send("Watch Video");
// // const handleEdit = (req, res) => res.send("Edit Video");
// export const watch = (req, res) => res.send("Watch Video");
// export const edit = (req, res) => res.send("Edit Video");
// export const search = (req, res) => res.send("search");

// // 최종
// export const trending = (req, res) => res.send("Home Page Videos");
// export const see = (req, res) => {
//     console.log(req.params);
//     return res.send(`Watch Video #${req.params.id}`)};
// export const edit = (req, res) => {
//     console.log(req.params);
//     return res.send("Edit Video")};
// export const search = (req, res) => res.send("search");
// export const upload = (req, res) => res.send("Upload");
// export const deleteVideo = (req, res) => {
//     console.log(req.params);
//     return res.send("Delete Video")};

// // HTML
// export const trending = (req, res) =>
//     res.send(
//         "<!DOCTYPE html><html lang='ko'><head><title>Wetube</title></head><body><h1>Home</h1><footer>&copy; 2023 Wetube</footer></body></html>"
//     );
// export const see = (req, res) => {
//     return res.send(
//         `<!DOCTYPE html><html lang='ko'><head><title>Wetube</title></head><body><h1>Watch video #${req.params.id}</h1><footer>&copy; 2023 Wetube</footer></body></html>`
//     );
// };
// export const edit = (req, res) => {
//     return res.send(
//         `<!DOCTYPE html><html lang='ko'><head><title>Wetube</title></head><body><h1>Edit video #${req.params.id}</h1><footer>&copy; 2023 Wetube</footer></body></html>`
//     );
// };
// export const search = (req, res) => res.send("search");
// export const upload = (req, res) => res.send("Upload");
// export const deleteVideo = (req, res) => {
//     console.log(req.params);
//     return res.send("Delete Video")};

// // pug
// export const trending = (req, res) => res.render("home");
// export const see = (req, res) => res.render("watch");
// export const edit = (req, res) => res.render("edit");
// export const search = (req, res) => res.send("search");
// export const upload = (req, res) => res.send("Upload");
// export const deleteVideo = (req, res) => {
//     console.log(req.params);
//     return res.send("Delete Video")};

// // pug - variable
// export const trending = (req, res) => res.render("home", { pageTitle : "Hello" });
// // home 파일을 렌더링하고, pageTitle이라는 변수를 보내고 있어.
// export const see = (req, res) => res.render("watch");
// export const edit = (req, res) => res.render("edit");
// export const search = (req, res) => res.send("search");
// export const upload = (req, res) => res.send("Upload");
// export const deleteVideo = (req, res) => {
//     console.log(req.params);
//     return res.send("Delete Video")};

// // Conditionals 조건문
// const fakeUser = {
//     username: "Nicolas",
//     loggedIn: true,
// };

// export const trending = (req, res) => res.render("home", { pageTitle : "Hello" , fakeUser: fakeUser });
// export const see = (req, res) => res.render("watch");
// export const edit = (req, res) => res.render("edit");
// export const search = (req, res) => res.send("search");
// export const upload = (req, res) => res.send("Upload");
// export const deleteVideo = (req, res) => {
//     console.log(req.params);
//     return res.send("Delete Video")};

// // Iteration 객체의 반복
// export const trending = (req, res) => {
//     const videos = [1, 2, 3, 4, 5, 6, 7];
//     res.render("home", { pageTitle : "Hello", videos });
// };
// export const see = (req, res) => res.render("watch");
// export const edit = (req, res) => res.render("edit");
// export const search = (req, res) => res.send("search");
// export const upload = (req, res) => res.send("Upload");
// export const deleteVideo = (req, res) => {
//     console.log(req.params);
//     return res.send("Delete Video")};

// // mixin; 똑똑한 partials
// export const trending = (req, res) => {
//     const videos = [
//         {
//             title: "First Video",
//             rating: 5,
//             comments: 2,
//             createdAt: "2 minutes ago",
//             views: 59,
//             id: 1,
//         },
//         {
//             title: "Second Video",
//             rating: 5,
//             comments: 2,
//             createdAt: "2 minutes ago",
//             views: 59,
//             id: 1,
//         },
//         {
//             title: "Third Video",
//             rating: 5,
//             comments: 2,
//             createdAt: "2 minutes ago",
//             views: 59,
//             id: 1,
//         }
//     ]
//     res.render("home", { pageTitle : "Hello", videos });
// };
// export const see = (req, res) => res.render("watch");
// export const edit = (req, res) => res.render("edit");
// export const search = (req, res) => res.send("search");
// export const upload = (req, res) => res.send("Upload");
// export const deleteVideo = (req, res) => {
//     console.log(req.params);
//     return res.send("Delete Video")};

// // #6 가짜 데이터베이스
// let videos = [
//     {
//         title: "First Video",
//         rating: 5,
//         comments: 2,
//         createdAt: "2 minutes ago",
//         views: 59,
//         id: 1,
//     },
//     {
//         title: "Second Video",
//         rating: 5,
//         comments: 2,
//         createdAt: "2 minutes ago",
//         views: 59,
//         id: 2,
//     },
//     {
//         title: "Third Video",
//         rating: 5,
//         comments: 2,
//         createdAt: "2 minutes ago",
//         views: 59,
//         id: 3,
//     }
// ]
// // 먼저, 나의 가짜 DB에 있는 모든 비디오들을 나열하고 싶어.
// export const trending = (req, res) => {
//     return res.render("home", { pageTitle : "Hello", videos }); // 여기서 비디오를 모두 나열하고 있다.
// };
// export const see = (req, res) => {
//     const {id} = req.params;
//     const video = videos[id - 1];
//     return res.render("watch", { pageTitle: `Watching ${video.title}` })
// };
// export const edit = (req, res) => res.render("edit");
// export const search = (req, res) => res.send("search");
// export const upload = (req, res) => res.send("Upload");
// export const deleteVideo = (req, res) => {
//     console.log(req.params);
//     return res.send("Delete Video")};

// #6 - Part 2
// let videos = [
//   {
//     title: "First Video",
//     rating: 5,
//     comments: 2,
//     createdAt: "2 minutes ago",
//     views: 1,
//     id: 1,
//   },
//   {
//     title: "Second Video",
//     rating: 5,
//     comments: 2,
//     createdAt: "2 minutes ago",
//     views: 59,
//     id: 2,
//   },
//   {
//     title: "Third Video",
//     rating: 5,
//     comments: 2,
//     createdAt: "2 minutes ago",
//     views: 59,
//     id: 3,
//   },
// ];
// export const trending = (req, res) => {
//   return res.render("home", { pageTitle: "Hello", videos }); // 여기서 비디오를 모두 나열하고 있다.
// };
// export const watch = (req, res) => {
//   const { id } = req.params;
//   const video = videos[id - 1];
//   return res.render("watch", { pageTitle: `Watching: ${video.title}`, video });
// };
// export const getEdit = (req, res) => {
//   const { id } = req.params;
//   const video = videos[id - 1];
//   return res.render("edit", { pageTitle: `Editing: ${video.title}`, video });
// };
// export const postEdit = (req, res) => {
//   const { id } = req.params;
//   const { title } = req.body; // req.body를 쓰기 위해서, server.js에서 express.urlencoded({extended:true})
//   // console.log(req.body); -> { title: 'Hey' } // title은 edit template에서 input의 name="title"
//   videos[id - 1].title = title; // 업데이트 (중요한 거 아님)
//   return res.redirect(`/videos/${id}`);
// };

// export const getUpload = (req, res) => {
//   return res.render("upload", { pageTitle: "Upload Video" });
// };

// export const postUpload = (req, res) => {
//   // here we will add a video to the videos array.
//   const {title} = req.body;
//   const newVideo = {
//     title: req.boby.title,
//     rating: 0,
//     comments: 0,
//     createdAt: "just now",
//     views: 0,
//     id: videos.length + 1,
//   };
//   videos.push(newVideo);
//   // console.log(req.body) // (2)input을 얻는 방법 = req.body <- 이때 input에 name은 무조건 있어야 한다.
//   return res.redirect("/"); // (1)우리가 직접 이 페이지를 보여준 게 아니라, 컨트롤러가 브라우저를 redirect 해 준거야.
// };

// DB생성, Model

// import Video from "../models/Video";

// export const home = (req, res) => {
//   console.log("Starting Search");
//   Video.find({}, (error, videos) => {
//     // console.log("errors", error);
//     // console.log("videos", videos);
//     console.log("Finished Search");
//   });
//   console.log("Hello");
//   return res.render("home", { pageTitle: "Home", videos: [] });
// };
// export const home = (req, res) => {
//   console.log("Start");
//   Video.find({}, (error, videos) => {
//     console.log("Finished"); // callback의 장점은 에러들을 여기에서 바로 볼 수 있다는 거야.
//     if (error) {
//       return res.render("server-error"); // something like that!
//     } // function 안에 function 별로야!
//     return res.render("home", { pageTitle: "Home", videos });
//   });
//   console.log("I finish first");
// };

/*
// callback

Video.find({}, (error, videos) => {
  if(error){
    return res.render("server-error")
  }
  return res.render("home", { pageTitle: "Home", videos });
})

*/

// // promise: await가 database를 기다려준다. find는 callback을 원하지 않는다는 걸 알고 찾아낸 비디오를 바로 출력해준다.
// export const home = async (req, res) => {
//   const videos = await Video.find({});
//   console.log(videos);
//   return res.render("home", { pageTitle: "Home", videos });
// };

// export const home = async (req, res) => {
//   try {
//     // console.log("i start");
//     const vidoes = await Video.find({});
//     // console.log("i finish");
//     // console.log(videos);
//     return res.render("home", { pageTitle: "Home", vidoes });
//   } catch (error) {
//     return res.render("server-error", { error });
//   }
// };

// export const postUpload = async (req, res) => {
//   const { title, description, hashtags } = req.body;
//   try {
//     await Video.create({
//       title,
//       description,
//       // createdAt,
//       hashtags: hashtags.split(",").map((word) => `#${word}`),
//       meta: {
//         views: 0,
//         rating: 0,
//       },
//     }); // (2) but, 여기에서 에러가 난다면?
//     return res.redirect("/");
//     // (1) video 생성에 문제가 없다면 home으로 보내질거야.
//   } catch (error) {
//     return res.render("upload", {
//       // console.log(error);
//       pageTitle: "Upload Video",
//       errorMessage: error._message,
//     });
//   } // (3) javascript는 catch문으로 이동한다. upload template를 다시 render 시킬거야.
//   // 사용자는 다시 upload form을 보게 되겠지만, 전과는 달리 에러 메세지와 함께 표시 될거야.
// };

// export const postUpload = async (req, res) => {
//   const { title, description, hashtags } = req.body;
//   // // console.log(title, description, hashtags);
//   await Video.create({
//     // video.create는 js object를 만들어주는 과정을 우리가 안 해도 돼.
//     // const video = new Video({
//     title,
//     description,
//     // createdAt: Date.now(),
//     // createdAt: "lldlkdkdjf",
//     hashtags: hashtags.split(",").map((word) => `#${word}`),
//     meta: {
//       views: 0,
//       rating: 0,
//     },
//   });
//   // // console.log(video);
//   // const dbVideo = await video.save();
//   // console.log(dbVideo);
//   // mongoose가 지원하는 save()는 promise를 리턴한다.
//   // 이 말은 save 작업이 끝날 때까지 기다려줘야 한다는 거야.
//   // const video = new Video({...})는 js에서만 존재해서 기다려 줄 필요가 없지만, save 한다면 말이 다르지.
//   // database에 기록되고 저장되는 데에는 시간이 조금 걸리니까 말이야!
//   // 기다림의 방법은 (req, res) 앞에 async를 적고 video.save() 앞에 await를 적어.
//   // 이제 우리는 db에 파일이 저장되는 것을 기다릴 수 있게 됐어.
//   return res.redirect("/");
// };

// 모델 만들기 ~!!!!

// import Video from "../models/Video";

// export const home = async (req, res) => {
//   const videos = await Video.find({}).sort({ createdAt: "desc" });
//   console.log(videos);
//   return res.render("home", { pageTitle: "Home", videos });
// };

// export const watch = async (req, res) => {
//   const { id } = req.params;
//   const video = await Video.findById(id);
//   // return res.render("watch", { pageTitle: video.title, video }); // 없는 video를 찾을 경우?
//   if (!video) {
//     // (videos === null)
//     return res.render("404", { pageTitle: "Video not found." }); // 에러를 먼저 처리해.
//   }
//   return res.render("watch", { pageTitle: video.title, video }); // 에러를 처리한 후 정상 코드를 실행해. (니코 방식)
// };

// export const getEdit = async (req, res) => {
//   const { id } = req.params;
//   const video = await Video.findById(id);
//   if (!video) {
//     return res.render("404", { pageTitle: "Video not found." }); // 에러를 먼저 처리해.
//   }
//   return res.render("edit", { pageTitle: `Edit: ${video.title}`, video }); // 에러를 처리한 후 정상 코드를 실행해. (니코 방식)
// };

// // part 3
// export const postEdit = async (req, res) => {
//   const { id } = req.params;
//   const { title, description, hashtags } = req.body;
//   const video = await Video.exist({ _id: id });
//   if (!video) {
//     return res.render("404", { pageTitle: "Video not found." });
//   }
//   await Video.findByIdAndUpdate(id, {
//     title,
//     description,
//     // hashtags: formatHashtags(hashtags), // Video.js에서 만든 함수를 import
//     hashtags: Video.formatHashtags(hashtags), // 직접 만든 function이 formatHashtags를 통해 접근 가능해졌다.
//     // .split(",")
//     // .map((word) => (word.startsWith("#") ? word : `#${word}`)),
//   });
//   // video.title = title;
//   // video.description = description;
//   // video.hashtags = hashtags
//   //   .split(",")
//   //   .map((word) => (word.startsWith("#") ? word : `#${word}`));
//   // await video.save();
//   return res.redirect(`/videos/${id}`);
// };

// // part 1~2
// // export const postEdit = async (req, res) => {
// //   const { id } = req.params;
// //   // console.log(req.body);
// //   const { title, description, hashtags } = req.body;
// //   const video = await Video.findById(id); // (1) 영상이 있는지 확인하고
// //   if (!video) {
// //     return res.render("404", { pageTitle: "Video not found." });
// //   } // (2) 만약 없다면 404를 렌더하면 돼.
// //   video.title = title; // (3) 그 다음엔 video.title을 title로 업데이트 하고
// //   video.description = description; // (3) video.description을 description으로 ..
// //   video.hashtags = hashtags
// //     .split(",")
// //     .map((word) => (word.startsWith("#") ? word : `#${word}`)); // (3) video.hashtags를 hashtag.function을 사용해서..
// //   await video.save(); // (4) 그리고선 변경된 사항들을 video.save로 저장하면 돼. 다만, 우리가 여기서 await을 사용했기 때문에 이 부분에서 에러가 생길 수 있어.
// //   return res.redirect(`/videos/${id}`);
// // };

// export const getUpload = (req, res) => {
//   return res.render("upload", { pageTitle: "Upload Video" });
// };

// export const postUpload = async (req, res) => {
//   const { title, description, hashtags } = req.body;
//   try {
//     await Video.create({
//       title,
//       description,
//       // createdAt,
//       hashtags: Video.formatHashtags(hashtags),
//       // hashtags: formatHashtags(hashtags),
//       // meta: {
//       //   views: 0,
//       //   rating: 0,
//       // },
//     });
//     return res.redirect("/");
//   } catch (error) {
//     return res.render("upload", {
//       pageTitle: "Upload Video",
//       errorMessage: error._message,
//     });
//   }
// };

// export const deleteVideo = async (req, res) => {
//   const { id } = req.params;
//   // delete video
//   await Video.findByIdAndDelete(id);
//   return res.redirect("/");
// };

// // Search - part 1.
// // export const search = async (req, res) => {
// //   // console.log(req.query);
// //   const { keyword } = req.query;
// //   console.log("Should search for ", keyword);
// //   res.render("search", { pageTitle: "Search" });
// // };

// // Search - part 2.
// export const search = async (req, res) => {
//   const { keyword } = req.query;
//   let videos = []; // 바깥에서 정의
//   if (keyword) {
//     videos = await Video.find({
//       // 업데이트 <- 이때 const 있으면 안된다!
//       // title: keyword, // 완전히 일치해야만 검색 가능하다..
//       title: {
//         $regex: new RegExp(keyword, "i"),
//         // 정규식을 사용해서 검색하려고 한다. // keyword를 포함하고 있는 title이 나온다.
//         // i는 소문자, 대문자 상관없게 함
//         // `^${keyword}` : keyword로 시작하는 제목만
//         // `${keyword}$` : keyword로 끝나는 제목만
//       },
//     });
//     // res.render("search", { pageTitle: "Search", videos });
//   }
//   res.render("search", { pageTitle: "Search", videos }); // videos는 if문 버블 안에서만 존재해.
// }; // 그렇다면 videos를 새로 정의하느 것 대신에, 바깥에서 정의된 videos를 단순히 업데이트만 하는 건 어떨까?
