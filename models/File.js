const mongoose = require("mongoose");
const fileSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    length: Number,
    chunkSize: Number,
    uploadDate: Date,
    filename: String,
  },
  { collection: "fs.files" }
); // Specify the collection name here

const File = mongoose.model("File", fileSchema);

module.exports = File;
