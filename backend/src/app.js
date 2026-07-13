const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const boardRoutes = require("./routes/board.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/boards", boardRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Backend is running"
    });
});

module.exports = app;