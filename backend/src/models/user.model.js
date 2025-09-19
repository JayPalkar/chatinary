import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      require: true,
      unique: true,
    },
    fullName: {
      type: String,
      require: true,
    },
    password: {
      type: String,
      minLength: 6,
    },
    profilePicture: {
      type: String,
      default: "https://avatar.iran.liara.run/public",
    },
    about: {
      type: String,
      default: "New To Chatinary",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
