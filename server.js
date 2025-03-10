import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { events } from "./eventConstants.js";

// Load environment variables
dotenv.config();
// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);
const corsOption = {
  origin:
    process.env.NODE_ENV === "development"
      ? process.env.CLIENT_URL_DEV
      : process.env.CLIENT_URL_LIVE,
  methods: ["*"],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  credentials: true,
  transports: ["websocket", "polling"],
};
const io = new Server(server, {
  cors: corsOption,
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOption));
app.options("*", cors(corsOption));

// Basic route
app.get("/", (req, res) => {
  res.status(200).json("iR notification app is running");
});

// const connectedUsers = new Map();
io.use((socket, next) => {
  const { username, userId } = socket.handshake.auth;
  if (!username && !userId) {
    return next(new Error("Invalid user details"));
  }
  // if (connectedUsers.has(userId)) {
  //   return next(new Error("already connected"));
  // }
  if (username && userId) {
    socket.username = username;
    socket.id = userId;
    // connectedUsers.set(userId, socket.id);
    return next();
  }
});

io.on("connection", (socket) => {
  const userName = socket.username;
  const userId = socket.id;
  console.log("connected");
  socket.emit(
    "connected",
    `User: ${userName}, ID: ${userId} is connected to the socket`
  );

  socket.on("POST_CREATED", (data) => {
    console.log("POST_CREATED", data);
    io.emit(events.POST_CREATED, data);
  });

  socket.on("disconnect", (reason) => {
    console.log("disconnected");
    if (reason === "io server disconnect") {
      socket.connect();
    }
  });
});

// Start server
const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
