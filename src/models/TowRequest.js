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
    vehicleDetails: { type: String },
    notes: { type: String },
    status: {
        type: String,
        enum: ["pending", "accepted", "in_progress", "completed", "cancelled"],
        default: "pending"
    },
    createdAt: { type: Date, default: Date.now }
}, {timestamps: true})

export default mongoose.model("TowRequest", towRequstSchema)