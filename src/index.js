import express from "express";

const app = express();
const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP" });
});

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
