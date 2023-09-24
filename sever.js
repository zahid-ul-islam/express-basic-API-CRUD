require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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
    password: String,
    age: Number,
  },
  {
    timestamps: true,
  }
);
//creating model of the schema to manipulate
const User = mongoose.model("User", userSchema);

//api to create user or register
app.post("/users", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(req.body.password, salt);
    const password = hash;
    const userObj = {
      fName: req.body.fName,
      lName: req.body.lName,
      email: req.body.email,
      password: password,
      age: req.body.age,
    };
    const user = new User(userObj);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    catchFunction(error, res);
  }
});
//api to login a user
app.post("/users/login", async (req, res) => {
  try {
    const { email, password, type, refreshToken } = req.body;
    if (!type) {
      res.status(401).json({ message: "type not found" });
    } else {
      if (type == "email") {
        await handleEmailLogin(email, res, password);
      } else {
        handleRefreshLogin(refreshToken, res);
      }
    }
  } catch (error) {
    catchFunction(error, res);
  }
});
//middleware to authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "unauthorized" });
  } else {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        res.status(401).json({ message: "unauthorized" });
      } else {
        req.user = user;
        next();
      }
    });
  }
};
//get an user profile
app.get("/profile", authenticateToken, async (req, res) => {
  try {
    const id = req.user.id;
    const user = await User.findById(id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "user not found" });
    }
  } catch (error) {
    catchFunction(error, res);
  }
});
//api to get all the user
app.get("/users", async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    catchFunction(error, res);
  }
});
//api to get a specific user via id. Just create for basic information. We make the updated get method for finding an user in the /profile request
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
    catchFunction(error, res);
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
    catchFunction(error, res);
  }
});
//api to delete user
app.delete("/users/:id", authenticateToken, async (req, res) => {
  try {
    const id = req.user.id;
    const user = await User.findByIdAndDelete(id);

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "user not found" });
    }
  } catch (error) {
    catchFunction(error, res);
  }
});

// server running checker
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
function handleRefreshLogin(refreshToken, res) {
  if (!refreshToken) {
    res.status(401).json({ message: "refresh token not defined" });
  } else {
    jwt.verify(refreshToken, process.env.JWT_SECRET, async (err, payload) => {
      if (err) {
        res.status(401).json({ message: "refresh token not matched" });
      } else {
        const id = payload.id;
        const user = await User.findById(id);
        if (!user) {
          res.status(401).json({ message: "unauthorized" });
        } else {
          getUserTokens(user, res);
        }
      }
    });
  }
}

async function handleEmailLogin(email, res, password) {
  const user = await User.findOne({ email: email });
  if (!user) {
    res.status(404).json({ message: "user not found" });
  } else {
    const isValidPass = await bcrypt.compare(password, user.password);
    if (!isValidPass) {
      res.status(401).json({ message: "Wrong password" });
    } else {
      getUserTokens(user, res);
    }
  }
}

function catchFunction(error, res) {
  console.error(error);
  res.status(500).json({ message: "something went wrong" });
}

function getUserTokens(user, res) {
  const accessToken = jwt.sign(
    { email: user.email, id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "2d" }
  );
  const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
  const userObj = user.toJSON();
  userObj["accessToken"] = accessToken;
  userObj["refreshToken"] = refreshToken;

  res.status(200).json(userObj);
}
