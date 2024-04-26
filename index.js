const { app, server } = require("./socket/socket");
const { routes } = require("./routes/Routes");
const { Connection } = require("./database/db");
Connection(
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  process.env.DB_URL,
  process.env.DB_NAME
);
const port = process.env.PORT || 3001;

server.listen(port, () => {
  console.log(
    "=========> envs",
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    process.env.DB_URL,
    process.env.DB_NAME
  );
  console.log(`Server listening on port ${port}`);
});

app.use("/", routes);
