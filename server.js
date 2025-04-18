/*********************************************************************************
*  WEB322 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Wing Zee Chan   Student ID: 180683237   Date: 2025-Apr-16
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

require('dotenv').config();

// Import the store-service.js module
const storeService = require("./store-service"); 

// Import the three modules
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

//require the auth-service.js module
const authData = require("./auth-service");

const clientSessions = require("client-sessions");


function ensureLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect("/login");
    } else {
        next();
    }
}

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

app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});

// Define the port to listen on (use environment variable if available, otherwise default to 8080)
const PORT = process.env.PORT || 8080;

// Use Express static middleware to serve static files from the "public" folder
app.use(express.static("public"));

app.use(clientSessions({
    cookieName: "session", // session object will be stored in req.session
    secret: "some_random_secret_key_here", // change this to a random string in production
    duration: 2 * 60 * 1000, // 2 minutes
    activeDuration: 1000 * 60 // 1 minute of extended activity
}));


app.use(express.urlencoded({ extended: true }));


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
        },
        formatDate: function(dateObj){
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
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
app.get("/items", ensureLogin, (req, res) => {
    if (req.query.category) {
        storeService.getItemsByCategory(req.query.category)
            .then(items => res.render("items", { items: items }))
            .catch(err => res.render("items", { message: "no results" }));
    } else if (req.query.minDate) {
        storeService.getItemsByMinDate(req.query.minDate)
            .then(items => res.render("items", { items: items }))
            .catch(err => res.render("items", { message: "no results" }));
    } else {
        storeService.getAllItems()
            .then(items => res.render("items", { items: items }))
            .catch(err => res.render("items", { message: "no results" }));
    }
});

// Route: Get all categories (for "/categories")
app.get("/categories", ensureLogin, (req, res) => {
    storeService.getCategories()
        .then(categories => {
            console.log("Categories sent to view:", categories);
            if (categories.length > 0) {
                res.render("categories", { categories: categories });
            } else {
                res.render("categories", { message: "no results" });
            }
        })
        .catch(err => {
            res.render("categories", { message: "no results" });
        });
});

// Route: GET /items/add
app.get("/items/add", ensureLogin, (req, res) => {
    storeService.getCategories()
        .then(data => res.render("addItem", { categories: data }))
        .catch(() => res.render("addItem", { categories: [] }));
});

// Route: GET /item/:id
app.get("/item/:id", (req, res) => {
    storeService.getItemById(req.params.id)
        .then(item => res.json(item))
        .catch(err => res.status(404).json({ message: err }));
});

// Route: POST /items/add
app.post("/items/add", ensureLogin, upload.single("featureImage"), (req, res) => {
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

app.get("/categories/add", ensureLogin, (req, res) => {
    res.render("addCategory");
});

app.post("/categories/add", ensureLogin, (req, res) => {
    console.log("Form submitted:", req.body);
    storeService.addCategory(req.body)
        .then(() => res.redirect("/categories"))
        .catch(err => {
            console.error("POST error:", err);
            res.status(500).send("Unable to create category");
        });
});


app.get("/categories/delete/:id", ensureLogin, (req, res) => {
    storeService.deleteCategoryById(req.params.id)
        .then(() => res.redirect("/categories"))
        .catch(() => res.status(500).send("Unable to Remove Category / Category not found"));
});

app.get("/items/delete/:id", ensureLogin, (req, res) => {
    storeService.deletePostById(req.params.id)
        .then(() => res.redirect("/items"))
        .catch(() => res.status(500).send("Unable to Remove Post / Post not found"));
});



// =======================
// Authentication Routes
// =======================

// GET /login
app.get("/login", (req, res) => {
    res.render("login");
});

// GET /register
app.get("/register", (req, res) => {
    res.render("register");
});

// POST /register
app.post("/register", (req, res) => {
    authData.registerUser(req.body)
        .then(() => {
            res.render("register", { successMessage: "User created" });
        })
        .catch(err => {
            res.render("register", {
                errorMessage: err,
                userName: req.body.userName
            });
        });
});

// POST /login
app.post("/login", (req, res) => {
    req.body.userAgent = req.get("User-Agent");

    authData.checkUser(req.body)
        .then(user => {
            req.session.user = {
                userName: user.userName,
                email: user.email,
                loginHistory: user.loginHistory
            };
            res.redirect("/items");
        })
        .catch(err => {
            res.render("login", {
                errorMessage: err,
                userName: req.body.userName
            });
        });
});

// GET /logout
app.get("/logout", (req, res) => {
    req.session.reset();
    res.redirect("/");
});

// GET /userHistory
app.get("/userHistory", ensureLogin, (req, res) => {
    res.render("userHistory");
});

// Route: Handle 404 (No Matching Route)
app.use((req, res) => {
    res.status(404).render("404");
});

// chain authData.initialize()
storeService.initialize()
.then(authData.initialize)
.then(() => {
    app.listen(PORT, () => {
        console.log("app listening on: " + PORT);
    });
})
.catch((err) => {
    console.log("unable to start server: " + err);
});


