require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const connectDB = require("./config/connectDB");
const User = require("./models/User");
app.use(bodyParser.json());
const authenticateToken = require("./middleware/auth");
connectDB();
app.use("/users", require("./routes/api/users"));
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
