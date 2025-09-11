import express from "express";
import http from "http"
import { Server } from "socket.io";
import mongoose  from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js"
import towRequestRoutes from "./routes/towRequestRoute.js"
import locationRoutes from './routes/locationRoutes.js'
import towingVehicleRoutes from './routes/towingVehicleRoutes.js'
import cors from "cors";
dotenv.config()

const app = express();
const server = http.createServer(app);
app.use(cors({
  origin: [process.env.CORS_ORIGIN || "http://localhost:3000"], 
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  credentials: true,
}));

const io = new Server(server, {
  cors: {
    origin: [process.env.CORS_ORIGIN || "http://localhost:3000"],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"]
  },
})

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = process.env.PORT || 5000;

// console.log(port);

const mongo_uri = process.env.MONGO_URI

mongoose.connect(mongo_uri)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("Error connecting DB",err));

app.get("/", (req, res) => {
  res.send("Hello World!");
});



app.use("/api/auth", authRoutes)
app.use("/api/location", locationRoutes)
app.use("/api/tow-requests", towRequestRoutes)
app.use('/api/towing-vehicles', towingVehicleRoutes)


io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("registerUser", (userId) => {
    socket.join(userId); 
    console.log(`✅ User ${userId} joined room`);
  });
  
  socket.on("disconnect", ()=> {
    console.log("User disconnected", socket.id);
    
  })
})

app.set("io", io);
server.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
