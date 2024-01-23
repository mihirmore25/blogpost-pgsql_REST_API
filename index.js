import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import express from "express";
import { db } from "./db.js";
import cookieParser from "cookie-parser";

// Routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import morgan from "morgan";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));

db.connect((err, res) => {
    if (err) {
        console.error(err);
    } else {
        console.log(
            `Database Connected Successfully On HOST:${res.host} and PORT:${res.port}`
        );
    }
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

app.listen(3000, () => {
    console.log("Server is listening on port 3000...");
});
