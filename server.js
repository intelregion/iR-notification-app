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
  origin: process.env.CLIENT_URL,
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
  res.status(200).json("Notification API is running");
});

// const connectedUsers = new Map();
io.use((socket, next) => {
  const { username, userId } = socket.handshake.auth;
  if (!username && !userId) {
    console.log("Invalid user details");
    return next(new Error("Invalid user details"));
  }
  // if (connectedUsers.has(userId)) {
  //   console.log("already connected");
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
  console.log("User connected:", socket.id, socket.username);
  const userId = socket.handshake.auth.userId;

  // Handle notification acknowledgements
  socket.on(events.POST_INTERACTIONS, (notificationId) => {
    console.log(`Notification ${notificationId} marked as read by ${userId}`);
  });

  socket.on("disconnect", (reason) => {
    connectedUsers.delete(socket.id);
    console.log("User disconnected:", socket.id, socket.username, reason);
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
