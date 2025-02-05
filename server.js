// Import the Express module
const express = require("express");

// Create an instance of an Express application
const app = express();

// Define the port to listen on (use environment variable if available, otherwise default to 8080)
const PORT = process.env.PORT || 8080;

// Use Express static middleware to serve static files from the "public" folder
app.use(express.static("public"));

// Define the "/" route to redirect to "/about"
app.get("/", (req, res) => {
    res.redirect("/about");
});

// Define the "/about" route to serve the about.html file
app.get("/about", (req, res) => {
    res.sendFile(__dirname + "/views/about.html");
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Express http server listening on port ${PORT}`);
});
