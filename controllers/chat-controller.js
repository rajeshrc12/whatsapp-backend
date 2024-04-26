const { Chat } = require("../models/Chat");
const { io } = require("../socket/socket");
const mongoose = require("mongoose");
const sendChats = async (req, res) => {
  try {
    let { chat, to, from } = req.body;
    chat = chat.map((c) => ({
      ...c,
      _id: new mongoose.Types.ObjectId(),
      createdAt: new Date(),
      seen: false,
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
    io.sockets.emit(to, chat);
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
    if (result) {
      chats = result.chats;
    }
    res.status(200).json(chats);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const getContacts = async (req, res) => {
  try {
    const { name } = req.params;
    let data = [];
    console.log(name);
    if (name) {
      const result = await Chat.aggregate([
        // Match documents where the given string is present in the users array
        { $match: { users: name } },
        // Project to remove the given string from users array and rename it to 'name'
        {
          $project: {
            name: {
              $filter: {
                input: "$users",
                as: "user",
                cond: { $ne: ["$$user", name] },
              },
            },
            chats: 1,
          },
        },
        // Filter chats where seen is false and chat.to is "rajesh"
        {
          $project: {
            name: 1,
            unseenChats: {
              $filter: {
                input: "$chats",
                as: "chat",
                cond: {
                  $and: [
                    { $eq: ["$$chat.seen", false] },
                    { $eq: ["$$chat.to", name] },
                  ],
                },
              },
            },
          },
        },
        // Project to count the number of unseen chats
        { $addFields: { unseenCount: { $size: "$unseenChats" } } },
        // Project to keep only 'name' and 'unseenCount' fields
        { $project: { _id: 0, name: 1, unseenCount: 1 } },
      ]);
      data = [];
      for (const user of result) {
        const res = await Chat.aggregate([
          {
            $match: {
              users: { $all: [user.name.join(""), name] },
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
        data.push({
          ...user,
          name: user.name.join(""),
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

module.exports = {
  sendChats,
  getChats,
  getContacts,
};
