import mongoose  from "mongoose";

const userSchema = new mongoose.Schema({
    email: {type: String, unique: true},
    name: String,
    phone: {type: String, unique: true},
    passwordHash: String,
    role: {type: String, enum: ["owner", "provider"], default: "owner"} ,
    isVerified: {type: Boolean, default: false},
    otp: String,
    otpExpiresAt: Date,
    otpResendCount: { type: Number, default: 0 },
    otpLastResend:  Date 
}, {timestamps: true})

export default mongoose.model("User", userSchema)