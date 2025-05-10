import express from "express";
import { configDotenv } from "dotenv";
import authRoute from "./route/auth.route.js";

import { connectDB } from "./lib/db.js";

configDotenv();

const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());

app.use("/api/auth", authRoute);

app.listen(PORT, () => {
  console.log("Server is running on port PORT " + PORT);
  connectDB();
});
