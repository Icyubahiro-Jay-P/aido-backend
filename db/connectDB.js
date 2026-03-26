import mongoose from "mongoose";

const connectDB = () => {
  console.log("Connecting to the database...");
  try{
    mongoose.connect(`${ process.env.MONGO_URI }`);
    console.log("Connected to the database");
  }
  catch (error) {
    console.log(error);
  }
};
export default connectDB;