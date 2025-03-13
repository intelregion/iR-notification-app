import mongoose from "mongoose";

const ConnectedUserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  socketId: { type: String, required: true },
  connectedAt: { type: Date, default: Date.now },
});

export default mongoose.model("ConnectedUser", ConnectedUserSchema);
