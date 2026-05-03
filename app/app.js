const express = require("express");
const app = express();

// Environment variables
const VERSION = process.env.VERSION || "BLUE";
const PORT = process.env.PORT || 3000;

// Project info
const STUDENT = "Spandan Duari";
const PROJECT = "VLE 8 - Blue Green Deployment";

// Root route (UI)
app.get("/", (req, res) => {
  const isGreen = VERSION === "GREEN";

  res.send(`
    <html>
      <head>
        <title>VLE 8</title>
      </head>
      <body style="font-family: Arial; text-align: center; margin-top: 50px;">
        
        <h1 style="color:${isGreen ? "green" : "blue"};">
          ${PROJECT}
        </h1>

        <h2>Student: ${STUDENT}</h2>

        <h3>
          Deployment Version: 
          <b style="color:${isGreen ? "green" : "blue"};">
            ${VERSION}
          </b>
        </h3>

        <h3>
          ${isGreen ? "🟢 GREEN (New Version Live)" : "🔵 BLUE (Current Stable Version)"}
        </h3>

        <p>Timestamp: ${new Date().toLocaleString()}</p>

      </body>
    </html>
  `);
});

// Health check (used by Jenkins)
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Debug/info endpoint (for testing)
app.get("/info", (req, res) => {
  res.json({
    project: PROJECT,
    student: STUDENT,
    version: VERSION,
    status: VERSION === "GREEN" ? "updated" : "stable",
    time: new Date()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} [${VERSION}]`);
});
