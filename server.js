import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import { initializeSocket } from "./sockets/index.js";
import routes from "./routes/index.js";
import connectDB from "./config/db.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Define CORS options to allow frontend requests
const corsOptions = {
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

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply CORS settings
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Load API routes
app.use("/", routes);

// Create an HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with the server
initializeSocket(server);

// Define the server port from environment variables
const PORT = process.env.PORT || 5000;

// Start the server and listen on the specified port
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
