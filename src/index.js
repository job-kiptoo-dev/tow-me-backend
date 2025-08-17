import express from "express";
import mongoose  from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js"

dotenv.config()

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = process.env.PORT || 5000;

// console.log(port);

const mongo_uri = process.env.MONGO_URI

console.log(mongo_uri);

mongoose.connect(mongo_uri)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("Error connecting DB",err));

app.get("/", (req, res) => {
  res.send("Hello World!");
});



app.use("/auth", authRoutes)

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
