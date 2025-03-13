import http from "http";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import app from "./app.js";
import { initializeSocket } from "./sockets/index.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Create an HTTP server using Express app
const server = http.createServer(app);

// Initialize Socket.IO with the server
initializeSocket(server);

// Define the server port from environment variables
const PORT = process.env.PORT || 5000;

// Start the server and listen on the specified port
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
