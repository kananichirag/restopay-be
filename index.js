const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const IndexRoutes = require("./routes/IndexRoutes");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const setupOrderSocket = require("./sockets/orderSocket");

dotenv.config();
const PORT = process.env.PORT || 3030;
// const HOST = '192.168.1.2';

app.use(cors());
app.use(express.json());
app.use("/v1", IndexRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://192.168.1.2:5173", "https://resto-pay.netlify.app/"],
    methods: ["GET", "POST"],
    credentials: true
  },
});

setupOrderSocket(io);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected .!!"))
  .catch((err) => console.log("Error to Connecting MongoDB", err));

server.listen(PORT, () => console.log(`Server running at http://${PORT}`));
