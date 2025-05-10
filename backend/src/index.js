import express from "express";
import { configDotenv } from "dotenv";
import authRoute from "./route/auth.route.js";
import cookieParser from "cookie-parser";

import { connectDB } from "./lib/db.js";
import usersRoute from "./route/user.route.js";
import chatRoute from "./route/chat.route.js";

configDotenv();

const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoute);
app.use("/api/users", usersRoute);
app.use("/api/chat", chatRoute);

app.listen(PORT, () => {
  console.log("Server is running on port PORT " + PORT);
  connectDB();
});
