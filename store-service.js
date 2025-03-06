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

// Function to get items by category
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

// Function to get items by minimum date
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

// Function to get an item by ID
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


// Function to get all categories
function getCategories() {
    return new Promise((resolve, reject) => {
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
        items.push(itemData); // Add new item to array
        resolve(itemData);
    });
}

// Export functions to be used in server.js
module.exports = { initialize, getAllItems, getPublishedItems, getCategories, addItem, getItemsByCategory, getItemsByMinDate, getItemById };
        