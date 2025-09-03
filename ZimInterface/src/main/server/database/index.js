import mongoose from "mongoose";
main().catch(err => console.log(err));
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/Zim');
    console.log("connected");
  }

  const db = mongoose.connection;

export default db
