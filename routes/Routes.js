const express = require("express");
const {
  pingUser,
  addUser,
  getAllUsers,
  getUser,
  setOpenProfile,
} = require("../controllers/user-controller");
const {
  sendChats,
  getChats,
  getContacts,
  readChats,
} = require("../controllers/chat-controller");
const routes = express.Router();

// User routes
routes.post("/user", addUser);
routes.get("/users", getAllUsers);
routes.get("/user/:email", getUser);
routes.post("/pinguser", pingUser);
routes.post("/openprofile", setOpenProfile);

// Chat routes
routes.post("/chat", sendChats);
routes.patch("/chat", readChats);
routes.get("/chat/:from/:to", getChats);
routes.get("/contact/:email", getContacts);

module.exports = {
  routes,
};
