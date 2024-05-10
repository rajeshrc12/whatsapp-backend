const { io, getOnlineUsers, removeOnlineUser } = require("../socket/socket");
const { user: User } = require("../models/User");
const mongoose = require("mongoose");
const fs = require("fs");
const { GridFSBucket } = require("mongodb");
const bucket = new GridFSBucket(mongoose.connection);
const addUser = async (req, res) => {
  try {
    let exist = await User.findOne({ email: req.body.email });
    if (exist) {
      res.status(200).json("User already exists");
      return;
    }
    const newUser = new User({
      ...req.body,
      lastSeen: new Date(),
      about: "Hey there! I am using WhatsApp.",
    });
    await newUser.save();
    res.status(200).json(newUser);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};
const getAllUsers = async (req, res) => {
  try {
    const result = await User.find();
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};
const getUser = async (req, res) => {
  try {
    let result = await User.findOne({ email: req.params.email });
    result._doc.openProfile = null;
    const onlineUsers = getOnlineUsers();
    const isUserOnline = onlineUsers.find(
      (user) => user.email === req.params.email
    );
    if (isUserOnline)
      result = {
        ...result._doc,
        lastSeen: "online",
        openProfile: isUserOnline.openProfile,
      };
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};
const logoutUser = (req, res) => {
  try {
    removeOnlineUser(req.params.email);
    res.status(200).send("User logged out");
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const setOpenProfile = (req, res) => {
  try {
    const { email, openProfile } = req.body;
    const onlineUsers = getOnlineUsers();
    const isUserOnline = onlineUsers.find((u) => u.email === email);
    if (isUserOnline) {
      isUserOnline.openProfile = openProfile;
      res.status(200).send(`${email} is online`);
    } else res.status(200).send(`${email} is offline`);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const updateUser = async (req, res) => {
  try {
    const { email, key, value } = req.body;
    console.log("updateUser", { email, key, value });
    const result = await User.findOneAndUpdate({ email }, { [key]: value });
    res.status(200).send(result);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const updateUserPhoto = async (req, res) => {
  try {
    const file = req.file;
    const { email } = JSON.parse(req.body.userData);
    const fileStream = fs.createReadStream(file.path);
    const uploadStream = bucket.openUploadStream(file.filename);
    fileStream.pipe(uploadStream);
    if (uploadStream.filename) {
      const result = await User.findOneAndUpdate(
        { email },
        { profileImageUrl: String(uploadStream.id) }
      );
      console.log(result);
    }
    res.status(200).send("hello");
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const deleteUserPhoto = async (req, res) => {
  try {
    const email = req.params.email;
    const result = await User.findOneAndUpdate(
      { email },
      { profileImageUrl: "" }
    );
    res.status(200).send(result);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

module.exports = {
  deleteUserPhoto,
  logoutUser,
  addUser,
  getAllUsers,
  getUser,
  setOpenProfile,
  updateUser,
  updateUserPhoto,
};
