const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const connectionString = `${process.env.MONGODB_CONNECTION_STRING}`;

module.exports.connect = async () => {
  try {
    mongoose.set("strictQuery", false);
    console.log(connectionString);
    mongoose
      .connect(connectionString)
      .then(() => console.log("Database connected " + new Date().toISOString()))
      .catch((error) => console.log("Database connection failed " + new Date().toISOString(), error));
  } catch (error) {
    console.log(error);
  }
};
