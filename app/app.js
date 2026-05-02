const express = require("express");
const app = express();

// Environment variables
const VERSION = process.env.VERSION || "BLUE";
const PORT = process.env.PORT || 3000;

// VLE 8 details
const STUDENT = "Spandan Duari";
const PROJECT = "VLE 8 - Blue Green Deployment";

// Root route
app.get("/", (req, res) => {
  res.send(`
    <h2>${PROJECT}</h2>
    <p>Student: ${STUDENT}</p>
    <p>Deployment Version: <b>${VERSION}</b></p>
  `);
});

// Health check (used by Jenkins + Kubernetes)
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Optional: extra info endpoint (good for viva/demo)
app.get("/info", (req, res) => {
  res.json({
    project: PROJECT,
    student: STUDENT,
    version: VERSION,
    time: new Date()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} [${VERSION}]`);
});