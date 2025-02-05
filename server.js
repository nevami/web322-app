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

// ✅ Route: Get all published items (i.e., for "/shop")
app.get("/shop", (req, res) => {
    const publishedItems = storeService.getPublishedItems();
    res.json(publishedItems);
});

// ✅ Route: Get all items (for "/items")
app.get("/items", (req, res) => {
    const allItems = storeService.getAllItems();
    res.json(allItems);
});

// ✅ Route: Get all categories (for "/categories")
app.get("/categories", (req, res) => {
    const allCategories = storeService.getAllCategories();
    res.json(allCategories);
});

// ✅ Route: Handle 404 (No Matching Route)
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Express http server listening on port ${PORT}`);
});
