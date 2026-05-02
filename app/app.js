const express = require("express");
const app = express();

// VLE 8 specific info
const VERSION = process.env.VERSION || "BLUE";
const STUDENT = "Spandan Duari";
const PROJECT = "VLE 8 - Blue Green Deployment";

// API route
app.get("/", (req, res) => {
  res.send(`
    <h2>${PROJECT}</h2>
    <p>Student: ${STUDENT}</p>
    <p>Deployment Version: <b>${VERSION}</b></p>
  `);
});

// Health check (important for real deployments)
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.listen(3000, () => {
  console.log(`Server running on port 3000 (${VERSION})`);
});