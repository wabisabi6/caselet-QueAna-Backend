const mongoose = require('mongoose');
const uri = "mongodb+srv://megha:aZQBhyX6OEuWzInd@cluster0.6rtz8.mongodb.net/?retryWrites=true&w=majority";


const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

const connectDB = async function run() {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    const conn = await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    return conn;
  } catch(err) {
    // Ensures that the client will close when you finish/error
    console.log("Error in connection : ", err)
  }
}
// connectDB().catch(console.dir);

module.exports = connectDB;