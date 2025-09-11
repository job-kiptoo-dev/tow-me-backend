import mongoose from "mongoose";

const towRequstSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    provider: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    pickupLocation: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    },
    dropoffLocation: {
        latitude: Number,
        longitude: Number
    },
    vehicleDetails: {
        make: { type: String },
        model: { type: String },
        year: { type: Number },
        color: { type: String },
        licensePlate: { type: String }
     },
    notes: { type: String },
    status: {
        type: String,
        enum: ["pending", "accepted", "in_progress", "completed", "cancelled"],
        default: "pending"
    },
    assignedVehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TowVehicle",
        default: null
    },
    createdAt: { type: Date, default: Date.now }
}, {timestamps: true})

export default mongoose.model("TowRequest", towRequstSchema)