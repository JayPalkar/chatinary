import express from "express";
import dotenv from "dotenv";

import { connectDB } from "./lib/db.js";
import authenticationRoutes from "./routes/authentication.routes.js";

dotenv.config();
const app = express();

const PORT = process.env.PORT;

app.use(express.json());

app.use("/api/auth", authenticationRoutes);

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
  connectDB();
});
