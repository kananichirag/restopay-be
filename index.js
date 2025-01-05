const express = require("express");
const app = express();
const IndexRoutes = require("./routes/IndexRoutes");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();
const PORT = process.env.PORT || 3030;
console.log(PORT)
const HOST = '192.168.1.7';


app.use(cors());
app.use(express.json());
app.use("/v1", IndexRoutes);

mongoose
  .connect(process.env.MONGO_URL)
  .then((e) => console.log("MongoDB Connected .!!"))
  .catch((err) => console.log("Error to Connecting MongoDB", err));
app.listen(PORT, HOST, () => console.log("Server Start"));
