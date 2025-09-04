import express from "express";
import Location from "../models/Location.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/update-location", authMiddleware, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    const location = await Location.findOneAndUpdate(
      { user: req.user.id },
      {
        location: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        updatedAt: new Date(),
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate("user");

    if (req.app.get("io")) {
      req.app.get("io").emit("locationUpdate", {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        properties: {
          userId: req.user.id,
          name: location?.user?.name,
          role: location?.user?.role,
          updatedAt: location.updatedAt,
        },
      });
    }

    res.json(location);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/nearby-provider", authMiddleware, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    const providers = await Location.find({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [longitude, latitude] },
          $maxDistance: 20000, 
        },
      },
    }).populate({
      path: "user",
      match: { role: "provider" },
    });

   
    const featureCollection = {
      type: "FeatureCollection",
      features: providers.map((p) => ({
        type: "Feature",
        geometry: p.location,
        properties: {
          userId: p.user?._id,
          name: p.user?.name,
          role: p.user?.role,
          updatedAt: p.updatedAt,
        },
      })),
    };

    res.json(featureCollection);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
