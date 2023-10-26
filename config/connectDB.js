const mongoose = require("mongoose");
const uri = process.env.MONGODB_URI;

const connectDB = async ()=>{
    try {
        await mongoose.connect(uri, { useNewUrlParser: true });
        console.log("Mongoose connection is open");
    } catch (error) {
        console.log("Mongoose connection error");
    }
}
module.exports = connectDB