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

const exphbs = require("express-handlebars");
const Handlebars = require("handlebars"); // Import Handlebars for custom helpers

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

// Define Handlebars Helpers **before initializing Handlebars**
const hbs = exphbs.create({
    extname: ".hbs",
    helpers: {
        navLink: function(url, options) {
            return `<li class="nav-item">
                <a class="nav-link ${url == app.locals.activeRoute ? "active" : ""}" href="${url}">${options.fn(this)}</a>
            </li>`;
        },
        equal: function(lvalue, rvalue, options) {
            if (!options || typeof options.fn !== "function" || typeof options.inverse !== "function") {
                console.error("Handlebars Helper 'equal' expects three arguments but received:", arguments);
                return "";
            }
            return (lvalue == rvalue) ? options.fn(this) : options.inverse(this);
        },
        safeHTML: function(context) {  //Added only the necessary change
            return new Handlebars.SafeString(context);
        }
    }
});

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');

// Middleware to track active route
app.use(function(req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

// Define the "/" route to redirect to "/about"
app.get("/", (req, res) => {
    res.redirect("/shop");
});

// Define the "/about" route to serve the about.html file
app.get("/about", (req, res) => {
    res.render("about");
});

// Route: Get all published items (for "/shop")
app.get("/shop", (req, res) => {
    let viewData = {};

    storeService.getPublishedItems()
        .then(items => {
            viewData.items = items;
            if (req.query.category) {
                return storeService.getPublishedItemsByCategory(req.query.category);
            } else {
                return storeService.getPublishedItems();
            }
        })
        .then(filteredItems => {
            viewData.posts = filteredItems;
            if (filteredItems.length > 0) {
                viewData.post = filteredItems[0];
            } else {
                viewData.message = "No results";
            }
            return storeService.getCategories();
        })
        .then(categories => {
            viewData.categories = categories;
            res.render("shop", { data: viewData });
        })
        .catch(err => {
            viewData.message = "No results";
            res.render("shop", { data: viewData });
        });
});

// Route: Get a specific item by ID (for "/shop/:id")
app.get("/shop/:id", (req, res) => {
    let viewData = {};

    // Step 1: Retrieve the specific post by ID
    storeService.getItemById(req.params.id)
        .then(post => {
            if (!post) {
                throw new Error("Post not found");
            }
            viewData.post = post;
            return storeService.getPublishedItemsByCategory(req.query.category || post.category);
        })
        .then(items => {
            viewData.posts = items; // Store related items
            return storeService.getCategories();
        })
        .then(categories => {
            viewData.categories = categories; // Store all categories
            res.render("shop", { data: viewData });
        })
        .catch(err => {
            viewData.message = "No results found";
            res.render("shop", { data: viewData });
        });
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
            .then(items => res.render("items", { items: items }))
            .catch(err => res.render("items", { message: "No items available." }));
    } else if (req.query.minDate) {
        storeService.getItemsByMinDate(req.query.minDate)
            .then(items => res.render("items", { items: items }))
            .catch(err => res.render("items", { message: "No items available." }));
    } else {
        storeService.getAllItems()
            .then(items => res.render("items", { items: items }))
            .catch(err => res.render("items", { message: "No items available." }));
    }
});

// Route: Get all categories (for "/categories")
app.get("/categories", (req, res) => {
    storeService.getCategories()
    .then(categories => {
        console.log("Categories sent to Handlebars:", categories); // Debugging log
        res.render("categories", { categories: categories });
    })  // Send data if successful
    .catch(err => {
        res.render("categories", { message: "No categories available." });
    });
});

// Route: GET /items/add
app.get("/items/add", (req, res) => {
    res.render("addItem");
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
    res.status(404).render("404");
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
    })
