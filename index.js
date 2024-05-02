const { app, server } = require("./socket/socket");
const { routes } = require("./routes/Routes");
const { Connection } = require("./database/db");
const multer = require("multer");
const { uploadFiles } = require("./controllers/chat-controller");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });
Connection(
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  process.env.DB_URL,
  process.env.DB_NAME
);
const port = process.env.PORT || 3001;

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

app.use("/", routes);
app.post("/files", upload.array("files"), uploadFiles);
