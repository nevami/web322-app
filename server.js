// Import the Express module
const express = require("express");

// Import the store-service.js module
const storeService = require("./store-service"); 

// Create Express app
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

// Route: Get all published items (for "/shop")
app.get("/shop", (req, res) => {
    storeService.getPublishedItems()
        .then(items => res.json(items))  // Send data if successful
        .catch(err => res.status(404).json({ message: err }));  // Send error if failed
});

// Route: Get all items (for "/items")
app.get("/items", (req, res) => {
    storeService.getAllItems()
        .then(items => res.json(items))  // Send data if successful
        .catch(err => res.status(404).json({ message: err }));  // Send error if failed
});

// Route: Get all categories (for "/categories")
app.get("/categories", (req, res) => {
    storeService.getCategories()
        .then(categories => res.json(categories))  // Send data if successful
        .catch(err => res.status(404).json({ message: err }));  // Send error if failed
});

// Route: Handle 404 (No Matching Route)
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

// Initialize data and start the server only if successful
storeService.initialize()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Express http server listening on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error("Failed to initialize data:", err);
    });
