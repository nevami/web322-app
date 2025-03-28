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


const fs = require("fs"); // Import file system module

// Global arrays to store data
let items = [];
let categories = [];

// Function to initialize data (read JSON files)
function initialize() {
    return new Promise((resolve, reject) => {
        fs.readFile("./data/items.json", "utf8", (err, data) => {
            if (err) {
                reject("Unable to read items.json");
                return;
            }

            // Parse the JSON and assign to items array
            items = JSON.parse(data);

            // Read categories.json only after items.json is successfully read
            fs.readFile("./data/categories.json", "utf8", (err, data) => {
                if (err) {
                    reject("Unable to read categories.json");
                    return;
                }

                // Parse the JSON and assign to categories array
                categories = JSON.parse(data);
                resolve("Data successfully initialized");
            });
        });
    });
}

// Function to get all items
function getAllItems() {
    return new Promise((resolve, reject) => {
        if (items.length > 0) {
            resolve(items);
        } else {
            reject("No results returned");
        }
    });
}

// Function to get only published items
function getPublishedItems() {
    return new Promise((resolve, reject) => {
        const publishedItems = items.filter(item => item.published === true);
        if (publishedItems.length > 0) {
            resolve(publishedItems);
        } else {
            reject("No results returned");
        }
    });
}

function getPublishedItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        const filteredItems = items.filter(item => item.published === true && item.category == category);
        if (filteredItems.length > 0) {
            resolve(filteredItems);
        } else {
            reject("No results returned");
        }
    });
}

// Function to get all categories
function getCategories() {
    return new Promise((resolve, reject) => {
        console.log("Loaded categories:", categories); // Debugging log
        if (categories.length > 0) {
            resolve(categories);
        } else {
            reject("No results returned");
        }
    });
}

// Function to add a new item
function addItem(itemData) {
    return new Promise((resolve, reject) => {
        if (!itemData.published) {
            itemData.published = false;
        } else {
            itemData.published = true;
        }
        
        itemData.id = items.length + 1; // Assign an ID based on array length

        // Set postDate to current date (YYYY-MM-DD format)
        itemData.postDate = new Date().toISOString().split("T")[0];

        items.push(itemData); // Add new item to array

        // Write updated items array back to items.json
        fs.writeFile("./data/items.json", JSON.stringify(items, null, 4), (err) => {
            if (err) {
                reject("Error saving item to file");
                return;
            }
            resolve(itemData);
        });
    });
}

// Function to get items by category (Part 4 Step 1)
function getItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        const filteredItems = items.filter(item => item.category == category);
        if (filteredItems.length > 0) {
            resolve(filteredItems);
        } else {
            reject("No results returned");
        }
    });
}

// Function to get items by minimum date (Part 4 Step 2)
function getItemsByMinDate(minDateStr) {
    return new Promise((resolve, reject) => {
        const filteredItems = items.filter(item => new Date(item.postDate) >= new Date(minDateStr));
        if (filteredItems.length > 0) {
            resolve(filteredItems);
        } else {
            reject("No results returned");
        }
    });
}

// Function to get an item by ID (Part 4 Step 3)
function getItemById(id) {
    return new Promise((resolve, reject) => {
        const foundItem = items.find(item => item.id == id);
        if (foundItem) {
            resolve(foundItem);
        } else {
            reject("No result returned");
        }
    });
}

// Export functions to be used in server.js
module.exports = { initialize, getAllItems, getPublishedItems, getPublishedItemsByCategory, getCategories, addItem, getItemsByCategory, getItemsByMinDate, getItemById };
