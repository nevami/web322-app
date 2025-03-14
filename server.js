/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Wing Zee Chan   Student ID: 180683237   Date: 2025-Mar-05
*
*  Render Web App URL: https://web322-app-rli5.onrender.com
* 
*  GitHub Repository URL: https://nevami.github.io/web322-app/
*
********************************************************************************/ 


// Ensure 'path' module is included
const path = require("path"); 

// Import the Express module
const express = require("express");

// Import the store-service.js module
const storeService = require("./store-service"); 

// Import the three modules
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Cloudinary configuration
cloudinary.config({
    cloud_name: 'dteikdexl',
    api_key: '872444824979794',
    api_secret: 'e3tf6Zqup84hUTkiWXAjBgF1CNM',
    secure: true
});

// Create an upload variable (no disk storage)
const upload = multer();

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
/* app.get("/items", (req, res) => {
    storeService.getAllItems()
        .then(items => res.json(items))  // Send data if successful
        .catch(err => res.status(404).json({ message: err }));  // Send error if failed
}); */

// Route: Get all items (for "/items") with optional filters
app.get("/items", (req, res) => {
    if (req.query.category) {
        storeService.getItemsByCategory(req.query.category)
            .then(items => res.json(items))
            .catch(err => res.status(404).json({ message: err }));
    } else if (req.query.minDate) {
        storeService.getItemsByMinDate(req.query.minDate)
            .then(items => res.json(items))
            .catch(err => res.status(404).json({ message: err }));
    } else {
        storeService.getAllItems()
            .then(items => res.json(items)) 
            .catch(err => res.status(404).json({ message: err }));
    }
});

// Route: Get all categories (for "/categories")
app.get("/categories", (req, res) => {
    storeService.getCategories()
        .then(categories => res.json(categories))  // Send data if successful
        .catch(err => res.status(404).json({ message: err }));  // Send error if failed
});

// Route: GET /items/add
app.get("/items/add", (req, res) => {
    res.sendFile(path.join(__dirname, "views/addItem.html"));
});

// Route: GET /item/:id
app.get("/item/:id", (req, res) => {
    storeService.getItemById(req.params.id)
        .then(item => res.json(item))
        .catch(err => res.status(404).json({ message: err }));
});

// Route: POST /items/add
app.post("/items/add", upload.single("featureImage"), (req, res) => {
    if(req.file){
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }

        upload(req).then((uploaded)=>{
            processItem(uploaded.url);
        });
    }else{
        processItem("");
    }
 
    /* function processItem(imageUrl){
        req.body.featureImage = imageUrl; */
        
    // TODO: Process the req.body and add it as a new Item before redirecting to /items
    function processItem(imageUrl){
        req.body.featureImage = imageUrl;
        storeService.addItem(req.body)
            .then(() => res.redirect("/items"))
            .catch(err => res.status(500).json({ message: "Error adding item" }));
    }
    
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
