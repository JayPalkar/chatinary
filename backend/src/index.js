import express from "express";
import authenticationRoutes from "./routes/authentication.routes.js";

const app = express();

app.use("/api/auth", authenticationRoutes);

app.listen(8000, () => {
  console.log("server is running on port 8000");
});
