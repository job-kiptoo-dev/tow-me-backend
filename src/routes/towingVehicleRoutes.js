import express from "express";
import TowVehicle from "../models/TowingVehicle.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();


// * Register a new towing vehicle
// * Provider only

router.post("/register", authMiddleware, authorize(["provider"]), async (req, res) => {
  try {
    const { vehicleType, plateNumber, capacity, model } = req.body;

    const existing = await TowVehicle.findOne({ plateNumber });
    if (existing) return res.status(400).json({ error: "Vehicle already registered" });

    const vehicle = new TowVehicle({
      provider: req.user._id,
      vehicleType,
      plateNumber,
      capacity,
      model,
    });

    await vehicle.save();
    res.status(201).json({ message: "Towing vehicle registered successfully", vehicle });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// * Get all vehicles (admin or owners can view)
 
router.get("/", authMiddleware, async (req, res) => {
  try {
    const vehicles = await TowVehicle.find()
      .populate("provider", "name phone email role");
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


 // Get vehicles by provider (for provider dashboard)
 
router.get("/my-vehicles", authMiddleware, authorize(["provider"]), async (req, res) => {
  try {
    const vehicles = await TowVehicle.find({ provider: req.user._id });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


 // Update vehicle availability

router.patch("/:id/availability", authMiddleware, authorize(["provider"]), async (req, res) => {
  try {
    const { available } = req.body;
    const vehicle = await TowVehicle.findOneAndUpdate(
      { _id: req.params.id, provider: req.user._id },
      { available },
      { new: true }
    );
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });

    res.json({ message: "Vehicle availability updated", vehicle });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
