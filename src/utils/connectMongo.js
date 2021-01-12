const mongoose = require("mongoose");
require("dotenv").config();

const connectMongoDb = () =>
  mongoose
    .connect(process.env.MONGODB_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
    })
    .then(() => console.log("MongoDB connected"))
    .catch((error) => console.log(error));

module.exports = { connectMongoDb };
