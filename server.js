import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./db/connectDB.js";
import { userRoutes } from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  }),
);
app.use(cookieParser())
app.use("/api/users", userRoutes);

app.get('/', () => {
  console.log('API is running');
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
