import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";


dotenv.config();

const app = express();

const PORT = process.env.PORT || 8000;


// Middleware
app.use(cors());

app.use(express.json());


// Test route
app.get("/", (req, res) => {

    res.json({
        message: "Book API is running"
    });
});


// Routes
app.use("/api/auth", authRoutes);

app.use("/api/books", bookRoutes);


// Start server after the database is ready.
const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
};

startServer();