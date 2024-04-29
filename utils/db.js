const mongoose = require('mongoose');

const connectDB = async () => {
  console.log(`MongoDB conn URI: ${process.env.MONGO_URI}`.cyan.underline.bold);
  const conn = await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connection successful'))
    .catch(err => console.error('MongoDB connection error:', err));

  //console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
  return conn
};

module.exports = connectDB;