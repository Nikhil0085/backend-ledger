const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      
    });

    console.log("connected to db");
  } catch (err) {
    console.log("error connecting to db");

    console.log(err); // ADD THIS

    process.exit(1);
  }
};

module.exports = connectDB;

