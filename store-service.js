/*********************************************************************************
*  WEB322 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Wing Zee Chan   Student ID: 180683237   Date: 2025-Apr-09
*
*  Render Web App URL: https://web322-app-rli5.onrender.com
* 
*  GitHub Repository URL: https://nevami.github.io/web322-app/
*
********************************************************************************/ 


//const fs = require("fs"); // REMOVE FILE HANDLING LOGIC RELATED TO JSON FILES

// REMOVE GLOBAL VARIABLES
// let items = [];
// let categories = [];

const Sequelize = require('sequelize');

var sequelize = new Sequelize('SenecaDB', 'SenecaDB_owner', 'npg_K7cF8qLjElCS', {
    host: 'ep-wild-wildflower-a8fqgp9u-pooler.eastus2.azure.neon.tech',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: {
            rejectUnauthorized: false
        }
    },
    query: { raw: true }
});

var Item = sequelize.define('Item', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN,
    price: Sequelize.DOUBLE
});

var Category = sequelize.define('Category', {
    category: Sequelize.STRING
});

Item.belongsTo(Category, { foreignKey: 'category' });


function initialize() {
    return new Promise((resolve, reject) => {
        sequelize.sync()
        .then(() => resolve())
        .catch(() => reject("unable to sync the database"));
    });
}

// Function to get all items
function getAllItems() {
    return new Promise((resolve, reject) => {
        Item.findAll()
        .then(data => resolve(data))
        .catch(() => reject("no results returned"));
    });
}

// Function to get only published items
function getPublishedItems() {
    return new Promise((resolve, reject) => {
        Item.findAll({ where: { published: true } })
            .then(data => resolve(data))
            .catch(() => reject("no results returned"));
    });
}

function getPublishedItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        Item.findAll({ where: { published: true, category: category } })
            .then(data => resolve(data))
            .catch(() => reject("no results returned"));
    });
}

function getCategories() {
    return new Promise((resolve, reject) => {
        Category.findAll()
            .then(data => resolve(data))
            .catch(() => reject("no results returned"));
    });
}

function addItem(itemData) {
    return new Promise((resolve, reject) => {
        itemData.published = (itemData.published) ? true : false;

        for (let prop in itemData) {
            if (itemData[prop] === "") {
                itemData[prop] = null;
            }
        }

        itemData.postDate = new Date();

        Item.create(itemData)
            .then(() => resolve())
            .catch(() => reject("unable to create post"));
    });
}

function getItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        Item.findAll({ where: { category: category } })
            .then(data => resolve(data))
            .catch(() => reject("no results returned"));
    });
}

function getItemsByMinDate(minDateStr) {
    return new Promise((resolve, reject) => {
        const { gte } = Sequelize.Op;
        Item.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr)
                }
            }
        })
        .then(data => resolve(data))
        .catch(() => reject("no results returned"));
    });
}

function getItemById(id) {
    return new Promise((resolve, reject) => {
        Item.findAll({ where: { id: id } })
            .then(data => resolve(data[0]))
            .catch(() => reject("no results returned"));
    });
}

function addCategory(categoryData) {
    return new Promise((resolve, reject) => {
        for (let prop in categoryData) {
            if (categoryData[prop] === "") {
                categoryData[prop] = null;
            }
        }

        Category.create(categoryData)
            .then(() => resolve())
            .catch(() => reject("unable to create category"));
    });
}

function deleteCategoryById(id) {
    return new Promise((resolve, reject) => {
        Category.destroy({
            where: { id: id }
        })
        .then(() => resolve())
        .catch(() => reject("unable to delete category"));
    });
}

function deletePostById(id) {
    return new Promise((resolve, reject) => {
        Item.destroy({
            where: { id: id }
        })
        .then(() => resolve())
        .catch(() => reject("unable to delete post"));
    });
}


// Export functions to be used in server.js
module.exports = { initialize, getAllItems, getPublishedItems, getPublishedItemsByCategory, getCategories, addItem, getItemsByCategory, getItemsByMinDate, getItemById, addCategory, deleteCategoryById, deletePostById };
