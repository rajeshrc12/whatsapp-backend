const { Server } = require("socket.io");
const express = require("express");
const http = require("http");
const cors = require("cors");
const bodyParser = require("body-parser");
const { user: User } = require("../models/User");
require("dotenv").config();

let onlineUsers = [];
const app = express();
app.use(bodyParser.json());
app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  })
);
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
const setLastSeen = async ({ email, lastSeen }) => {
  await User.updateOne({ email }, { $set: { lastSeen } });
};
io.on("connection", (socket) => {
  // console.clear();
  if (!onlineUsers.find((user) => user.email === socket.handshake.query.email))
    onlineUsers.push({
      email: socket.handshake.query.email,
    });
  console.log("Online Users", onlineUsers);
  socket.broadcast.emit("onlineUsers", onlineUsers);
  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter(
      (user) => user.email !== socket.handshake.query.email
    );
    console.log("Online Users", onlineUsers);
    setLastSeen({ email: socket.handshake.query.email, lastSeen: new Date() });
    console.log({ email: socket.handshake.query.email, lastSeen: new Date() });
    socket.broadcast.emit("onlineUsers", onlineUsers);
  });
});

const getOnlineUsers = () => onlineUsers;

module.exports = {
  app,
  io,
  server,
  getOnlineUsers,
};
