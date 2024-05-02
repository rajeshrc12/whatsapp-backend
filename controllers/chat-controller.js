const { Chat } = require("../models/Chat");
const { io, getOnlineUsers } = require("../socket/socket");
const mongoose = require("mongoose");
const { user: User } = require("../models/User");
const moment = require("moment");
const sendChats = async (req, res) => {
  try {
    let { chat, to, from } = req.body;
    chat = chat.map((c) => ({
      ...c,
      _id: new mongoose.Types.ObjectId(),
      createdAt: new Date(),
    }));
    let result = false;
    const existingChat = await Chat.findOne({
      users: { $all: [from, to] },
    });
    if (existingChat) {
      // If a matching chat document exists, update it by pushing the new chat message
      const updatedChat = await Chat.findByIdAndUpdate(
        existingChat._id,
        { $push: { chats: { $each: chat } } },
        { new: true } // Return the updated document
      );
      result = updatedChat;
    } else {
      // If no matching chat document exists, create a new chat document
      const newChat = new Chat({
        users: [from, to],
        chats: chat,
      });
      const savedChat = await newChat.save();
      result = savedChat;
    }
    const onlineUsers = getOnlineUsers();
    const isUserOnline = onlineUsers.find((user) => user.email === to);
    if (isUserOnline) {
      if (isUserOnline.openProfile === from) {
        io.sockets.emit(to, { type: "updateChats", chat });
      } else {
        io.sockets.emit(to, { type: "fetchContacts" });
      }
    }
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const getChats = async (req, res) => {
  try {
    let { from, to } = req.params;
    let chats = [];
    const result = await Chat.findOne({
      users: { $all: [from, to] },
    });
    const newChat = [];

    if (result?.chats?.length) {
      let date = moment(result.chats[0].createdAt)
        .format("DD/MM/YYYY")
        .slice(0, 10);
      newChat.push({
        _id: new mongoose.Types.ObjectId(),
        type: "date",
        date,
      });
      for (const ch of result.chats) {
        if (date === moment(ch.createdAt).format("DD/MM/YYYY").slice(0, 10)) {
          newChat.push(ch);
        } else {
          date = moment(ch.createdAt).format("DD/MM/YYYY").slice(0, 10);
          newChat.push({
            _id: new mongoose.Types.ObjectId(),
            type: "date",
            date,
          });
          newChat.push(ch);
        }
      }
    }
    res.status(200).json(newChat);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const getContacts = async (req, res) => {
  try {
    const { email } = req.params;
    let data = [];
    console.log(email);
    if (email) {
      const result = await Chat.aggregate([
        // Match documents where the given string is present in the users array
        { $match: { users: email } },
        // Project to remove the given string from users array and rename it to 'name'
        {
          $project: {
            email: {
              $filter: {
                input: "$users",
                as: "user",
                cond: { $ne: ["$$user", email] },
              },
            },
            chats: 1,
          },
        },
        // Filter chats where seen is false and chat.to is "rajesh"
        {
          $project: {
            email: 1,
            unseenChats: {
              $filter: {
                input: "$chats",
                as: "chat",
                cond: {
                  $and: [
                    { $eq: ["$$chat.seen", false] },
                    { $eq: ["$$chat.to", email] },
                  ],
                },
              },
            },
          },
        },
        // Project to count the number of unseen chats
        { $addFields: { unseenCount: { $size: "$unseenChats" } } },
        // Project to keep only 'email' and 'unseenCount' fields
        { $project: { _id: 0, email: 1, unseenCount: 1 } },
      ]);
      data = [];
      for (const user of result) {
        const res = await Chat.aggregate([
          {
            $match: {
              users: { $all: [user.email.join(""), email] },
            },
          },
          {
            $project: {
              lastChat: { $arrayElemAt: [{ $slice: ["$chats", -1] }, 0] },
            },
          },
          {
            $replaceRoot: { newRoot: "$lastChat" },
          },
        ]);
        const nameRes = await User.findOne({ email: user.email.join("") });
        data.push({
          ...user,
          name: nameRes.name,
          profileImageUrl: nameRes.profileImageUrl,
          email: user.email.join(""),
          lastChat: res[0],
        });
      }
    }
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const readChats = async (req, res) => {
  try {
    let { from, to } = req.body;
    const result = await Chat.updateMany(
      {
        users: { $all: [from, to] },
        "chats.to": from,
        "chats.from": to,
      },
      { $set: { "chats.$[elem].seen": true } },
      { arrayFilters: [{ "elem.to": from, "elem.from": to }] }
    );
    const onlineUsers = getOnlineUsers();
    const isUserOnline = onlineUsers.find((user) => user.email === to);
    if (isUserOnline) {
      io.sockets.emit(to, { type: "fetchContactsAndChats" });
    }
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};
const uploadFiles = async (req, res) => {
  try {
    const files = req.files;
    console.log(files);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

module.exports = {
  sendChats,
  getChats,
  getContacts,
  readChats,
  uploadFiles,
};
