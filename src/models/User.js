import bcrypt from "bcrypt";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  avatarUrl: String, // 깃헙이 주는 링크
  // (3/17 금) 하나 추가해주자. user가 Github로 로그인했는지 여부를 알기 위해서.
  socialOnly: { type: Boolean, default: false }, // 이건 로그인 페이지에서 유저가 email로 로그인하려는데 password가 없을 때 유용할 수 있어.
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String },
  location: String,
});

// save 하기 전에 async function을 쓸 건데,
userSchema.pre("save", async function () {
  // console.log("Users", this.password);
  // 이 안에서 this.password를 가지고 해싱을 할 거야.
  this.password = await bcrypt.hash(this.password, 5);
  // hash() 안에 암호화 될 data를 넣어주면 돼.
  // this ? => create 되는 USer !
  // console.log("Hashed password", this.password);
});

const User = mongoose.model("User", userSchema);
export default User;
