import express from "express";
import {
  signupControler,
  signOutControler,
  signinControler,
} from "../controllers/auth.controlers.js";

const authRoute = express.Router();

authRoute.post("/login", signinControler);

authRoute.post("/signup", signupControler);

authRoute.post("/logout", signOutControler);

export default authRoute;
