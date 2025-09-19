import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const getAllUsers = async (req, res) => {
  try {
    const loggedInUser = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUser },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllChatsForSidebar = async (req, res) => {
  try {
    const loggedInUser = req.user._id;

    const messages = await Message.find({
      $or: [{ senderId: loggedInUser }, { receiverId: loggedInUser }],
    }).select("senderId receiverId -_id");

    const chatUserIds = new Set();
    messages.forEach((msg) => {
      if (msg.senderId.toString() !== loggedInUser.toString()) {
        chatUserIds.add(msg.senderId.toString());
      }
      if (msg.receiverId.toString() !== loggedInUser.toString()) {
        chatUserIds.add(msg.receiverId.toString());
      }
    });

    const chatUsers = await User.find({
      _id: { $in: Array.from(chatUserIds) },
    }).select("-password");

    res.status(200).json(chatUsers);
  } catch (error) {
    console.log("Error in getAllChats controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("error in getMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    // const { text, image } = req.body;
    // const { id: receiverId } = req.params;
    // const senderId = req.user._id;

    // let imageUrl;
    // if (image) {
    //   const uploadResponse = await cloudinary.uploader.upload(image);
    //   imageUrl = uploadResponse.secure_url;
    // }

    // const newMessage = new Message({
    //   senderId,
    //   receiverId,
    //   text,
    //   image: imageUrl,
    // });
    const { ciphertext, iv, salt, senderPublicKey, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!ciphertext || !iv || !salt || !senderPublicKey) {
      return res.status(400).json({ message: "Missing encrypted payload" });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      ciphertext,
      iv,
      salt,
      senderPublicKey,
      image,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
