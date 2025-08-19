import express from 'express';
import TowRequest from '../models/TowRequest.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {authorize } from '../middleware/roleMiddleware.js'

const router  = express.Router()


function getDistanceKm(coord1, coord2) {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(coord2.latitude - coord1.latitude);
    const dLon = toRad(coord2.longitude - coord1.longitude);

    const a =
        Math.sin(dLat / 2) ** 2 + 
        Math.cos(toRad(coord1.latitude)) * 
            Math.cos(toRad(coord2.latitude)) *
            Math.sin(dLon / 2) ** 2;
    return R * 2  * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));        
}

// listen "towRequest:new"
router.post("/", authMiddleware, authorize(["user"]), async (req, res) => {
    try {
        const {pickupLocation, dropoffLocation, vehicleDetails, notes} = req.body;

        const towRequest = new TowRequest({
            user: req.user._id,
            pickupLocation,
            dropoffLocation,
            vehicleDetails,
            notes,
            status: "pending"
        })
        await towRequest.save()

        const io = req.app.get("io")
        const radiusKm = 20;

        for (const [socketId, provider] of Object.entries(global.providers || {})) {
            if (!provider.coords) continue;
            
            const distance = getDistanceKm(
                {latitude: pickupLocation.latitude, longitude: pickupLocation.longitude},
                { latitude: provider.coords.latitude, longitude: provider.coords.longitude }

            );

            if (distance <= radiusKm) {
                io.to(socketId).emit("towRequest:new", towRequest)
            }
        }
        res.status(201).json({message: "Tow request created successfully"})
    } catch (err) {
        res.status(500).json({error: err.message})
    }
})

router.get("/provider", authMiddleware, authorize(["provider"]), async(req, res) => {
    try {
        const towRequests = await TowRequest.find({status: "pending"})
            .populate("user", "name phone")
            .sort({ createdAt: -1})
        res.json(towRequests)    
    } catch (err) {
        res.status(500).json({error: err.message})
    }
} )

// listen  "towRequest:accepted"
router.patch("/:id/accept", authMiddleware, authorize(["provider"]), async( req, res) => {
    try {
        const towRequest = await TowRequest.findById(req.params.id);
        if (!towRequest) return res.status(404).json({error: "Tow request not found"});

        towRequest.provider = req.user._id,
        towRequest.status = "accepted",
        await towRequest.save();

        const io = req.app.get("io");
        io.to(towRequest.user.toString()).emit("towRequest:accepted", towRequest)

        res.json({message: "Tow request accepted", towRequest})


    } catch (err) {
        res.status(500).json({error: err.message})
    }
})

// listen  "towRequest:completed"
router.patch("/:id/complete", authMiddleware, authorize(["provider"]), async( req, res) => {
    try {
        const towRequest = await TowRequest.findById(req.params.id);
        if (!towRequest) return res.status(404).json({error: "Tow request not found"});

        towRequest.status = "completed"
        await towRequest.save()

        const io = req.app.get("io");
        io.to(towRequest.user.toString()).emit("towRequest:completed", towRequest);
        res.json({message: "Tow request completed", towRequest})
    } catch (err) {
        res.status(500).json({error: err.message})
    }
})

export default router