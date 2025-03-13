import { Server } from "socket.io";
import ConnectedUser from "../models/ConnectedUser.js";
import { events } from "../utils/eventConstants.js";

// Function to initialize Socket.IO
export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin:
        process.env.NODE_ENV === "development"
          ? process.env.CLIENT_URL_DEV
          : process.env.CLIENT_URL_LIVE,
      methods: ["*"],
      credentials: true,
      transports: ["websocket", "polling"],
    },
  });

  // Middleware to authenticate users connecting via socket
  io.use(async (socket, next) => {
    try {
      const { username, userId } = socket.handshake.auth;

      if (!username || !userId) {
        console.log("Invalid user details:", socket.handshake.auth);
        return next(new Error("Invalid user details"));
      }

      console.log("User connecting:", { username, userId });

      // Store user connection details in the database
      await ConnectedUser.findOneAndUpdate(
        { userId },
        { username, socketId: socket.id, connectedAt: new Date() },
        { upsert: true, new: true }
      );

      socket.username = username;
      socket.userId = userId;

      return next();
    } catch (error) {
      console.error("Socket Handshake Error:", error);
      next(new Error("Internal server error"));
    }
  });

  // Handle new socket connections
  io.on("connection", (socket) => {
    console.log("User connected:", {
      username: socket.username,
      userId: socket.userId,
    });

    // Notify the client that connection was successful
    socket.emit(
      "connected",
      `User: ${socket.username}, ID: ${socket.userId} is connected`
    );

    // Handle post creation event
    socket.on(events.POST_CREATED, (data) => {
      console.log("Post Created:", data);
      io.emit(events.POST_CREATED, data);
    });

    // Handle post approval event and notify the author
    socket.on(events.POST_APPROVED, (authorId) => {
      console.log("Post Approved:", authorId);
      io.to(authorId).emit(events.POST_APPROVED, authorId);
    });

    // Handle user disconnection
    socket.on("disconnect", async (reason) => {
      console.log(`User ${socket.userId} disconnected`);

      // Remove user from database when disconnected
      await ConnectedUser.findOneAndDelete({ userId: socket.userId });

      if (reason === "io server disconnect") {
        socket.connect(); // Reconnect if server disconnected the user
      }
    });
  });
};
