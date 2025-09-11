
import mongoose from "mongoose";

const towVehicleSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true
  },
  plateNumber: {
    type: String,
    required: true,
    unique: true
  },
  vehicleType: {
    type: String,
    enum: ["Flatbed", "HookAndChain", "WheelLift", "Integrated"],
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  currentRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TowRequest",
    default: null
  }
}, { timestamps: true });

export default mongoose.model("TowVehicle", towVehicleSchema);
