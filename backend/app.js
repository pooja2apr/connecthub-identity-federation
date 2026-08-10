const express = require("express");
const cors = require("cors");
require("dotenv").config();
const discoveryRoutes = require("./routes/discovery.routes");
const authRoutes = require("./routes/auth.routes");
const app = express();


app.use(cors());
app.use(express.json());
app.use("/api", discoveryRoutes);
app.use("/auth", authRoutes);


app.get("/", (req, res) => {
    res.send("ConnectHub Identity Federation API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});