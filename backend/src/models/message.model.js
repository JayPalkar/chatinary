import mongoose, { mongo } from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    // text: {
    //   type: String,
    // },
    image: {
      type: String,
    },
    ciphertext: {
      type: String,
    },
    iv: {
      type: String,
    },
    salt: {
      type: String,
    },
    senderPublicKey: {
      type: String,
    },
    imageiv: {
      type: String,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
