import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/index.js";

// Load environment variables
dotenv.config();

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

export default app;
