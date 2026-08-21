const express = require("express");
const cors = require("cors");
require("dotenv").config();
const session = require("express-session");
const app = express();
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false,
            maxAge: 60 * 60 * 1000
        }
    })
);
const protectedRoutes = require("./routes/protected.routes");
const discoveryRoutes = require("./routes/discovery.routes");
const authRoutes = require("./routes/auth.routes");
const oidcDiscoveryRoutes =
    require("./routes/oidcDiscovery.routes");



app.use(cors());
app.use(express.json());
app.use("/api", protectedRoutes);
app.use("/api", discoveryRoutes);
app.use("/auth", authRoutes);
const jwksRoutes =
    require("./routes/jwks.routes");
    app.use("/", jwksRoutes);
    app.use("/", oidcDiscoveryRoutes);


app.get("/", (req, res) => {
    res.send("ConnectHub Identity Federation API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});