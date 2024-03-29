const mongoose = require('mongoose');

const connectDB = async () => {
  console.log(`MongoDB conn URI: ${process.env.MONGO_URI}`.cyan.underline.bold);
  const conn = await mongoose.connect(process.env.MONGO_URI);

  console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
  return conn
};

module.exports = connectDB;