require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
app.use(bodyParser.json());

//mongodb connection api
const uri = process.env.MONGODB_URI;
mongoose.connect(uri, { useNewUrlParser: true });
//if connection is ok
mongoose.connection.on("connected", () => {
  console.log("Mongoose connection is open");
});
//if there is error connection
mongoose.connection.on("error", () => {
  console.log("Mongoose connection error");
});

//my mongodb schema like that
const userSchema = new mongoose.Schema(
  {
    fName: String,
    lName: String,
    email: String,
    age: Number,
  },
  {
    timestamps: true,
  }
);
//creating model of the schema to manipulate
const User = mongoose.model("User", userSchema);

//api to create user
app.post("/users", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "something went wrong" });
  }
});
//api to get all the user
app.get("/users", async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "something went wrong" });
  }
});
//api to get a specific user via id
app.get("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "user not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "something went wrong" });
  }
});
//api to update an user
app.put("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;
    const user = await User.findByIdAndUpdate(id, body, { new: true });

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "user not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "something went wrong" });
  }
});
//api to delete user
app.delete("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByIdAndDelete(id);

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "user not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "something went wrong" });
  }
});


// connection check
app.get("/", (req, res) => {
  res.json("Welcome");
});
// server running checker
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
