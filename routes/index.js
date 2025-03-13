import express from "express";

const router = express.Router();

// Basic route to check server status
router.get("/", (req, res) => {
  res.status(200).json("iR notification app is running");
});

export default router;
