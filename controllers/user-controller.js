const { io, getOnlineUsers } = require("../socket/socket");
const { user: User } = require("../models/User");

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
const pingUser = (req, res) => {
  try {
    const { name, message } = req.body;
    io.sockets.emit(name, message);
    res.status(200).send({ name, message });
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

module.exports = {
  pingUser,
  addUser,
  getAllUsers,
  getUser,
  setOpenProfile,
};
