import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateOTP, sendEmailOTP } from "../utils/otp.js";
import User from "../models/user.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  
  try {
    const { name, email, phone, password, role } = req.body;

    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const otp = await generateOTP();

    const newUser = await User.create({
      name,
      email,
      phone,
      role,
      passwordHash,
      otp,
      otpExpiresAt: Date.now() + 5 * 60 * 1000,
      isVerified: false,
    });

    if (email) await sendEmailOTP(email, otp);
    // if (phone) await sendSMSOTP(phone, otp);

    res.json({ message: "OTP sent via email/SMS. Verify to continue." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/verify", async (req, res) => {
  try {
    const { email, phone, otp } = req.body;

    const existUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (!existUser) return res.status(404).json({ error: "User not found" });

    if (existUser.otp !== otp || Date.now() > existUser.otpExpiresAt) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    existUser.isVerified = true;
    existUser.otp = null;
    existUser.otpExpiresAt = null;
    existUser.otpResendCount = 0;
    existUser.otpLastResend = null;
    await existUser.save();

    const token = jwt.sign(
      { id: existUser._id, role: existUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d"}
    );

    res.json({ message: "Verified successfully", token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    const existUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (!existUser) return res.status(401).json({ error: "User not found" });

    if (!existUser.isVerified) {
      const otp = await generateOTP();
      existUser.otp = otp;
      existUser.otpExpiresAt = Date.now() + 5 * 60 * 1000;
      await existUser.save();

      if (existUser.email) await sendEmailOTP(existUser.email, otp);
      // if (existUser.phone) await sendSMSOTP(existUser.phone, otp);

      return res
        .status(403)
        .json({ error: "User not verified. OTP sent for verification." });
    }

  
    const valid = await bcrypt.compare(password, existUser.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

   
    const token = jwt.sign(
      { id: existUser._id, role: existUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user: existUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const now = new Date();

    if (user.otpLastResend && now - user.otpLastResend > 60 * 60 * 1000) {
      user.otpResendCount = 0;
    }

    if (user.otpResendCount >= 3) {
      return res.status(429).json({ error: "Too many resend attempts. Try again later." });
    }

    const otp = generateOTP();

    user.otp = otp;
    user.otpExpiresAt = Date.now() + 5 * 60 * 1000; 
    user.otpResendCount += 1;
    user.otpLastResend = now;
    await user.save();
  
    await sendEmailOTP(user.email, otp );
    res.json({ message: "OTP resent successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});


export default router;
