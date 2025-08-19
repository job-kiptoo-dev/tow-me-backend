import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
  location: {
    type: { type: String, enum: ["Point"], required: true, default: "Point" },
    coordinates: { type: [Number], required: true }, 
  },
  updatedAt: { type: Date, default: Date.now },
});

// Create 2dsphere index for GeoJSON
locationSchema.index({ location: "2dsphere" });

export default mongoose.model("Location", locationSchema);
