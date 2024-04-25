const { Server } = require("socket.io");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  })
);
const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  },
});
let onlineUsers = [];
io.on("connection", (socket) => {
  // console.clear();
  if (!onlineUsers.find((user) => user.email === socket.handshake.query.email))
    onlineUsers.push({
      email: socket.handshake.query.email,
    });
  console.log("Online Users", onlineUsers);
  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter(
      (user) => user.email !== socket.handshake.query.email
    );
    console.log("Online Users", onlineUsers);
  });
});
app.post("/", (req, res) => {
  const { message, email } = req.body;
  console.log(message, onlineUsers);
  for (const user of onlineUsers.filter((user) => user.email !== email)) {
    io.sockets.emit(user.email, message);
  }
});
