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

function initialize() {
    return new Promise((resolve, reject) => {
        reject(); // RETURN "EMPTY" PROMISE
    });
}

// Function to get all items
function getAllItems() {
    return new Promise((resolve, reject) => {
        reject(); // RETURN "EMPTY" PROMISE
    });
}

// Function to get only published items
function getPublishedItems() {
    return new Promise((resolve, reject) => {
        reject(); // RETURN "EMPTY" PROMISE
    });
}

function getPublishedItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        reject(); // RETURN "EMPTY" PROMISE
    });
}

function getCategories() {
    return new Promise((resolve, reject) => {
        reject(); // RETURN "EMPTY" PROMISE
    });
}

function addItem(itemData) {
    return new Promise((resolve, reject) => {
        reject(); // RETURN "EMPTY" PROMISE
    });
}

function getItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        reject(); // RETURN "EMPTY" PROMISE
    });
}

function getItemsByMinDate(minDateStr) {
    return new Promise((resolve, reject) => {
        reject(); // RETURN "EMPTY" PROMISE
    });
}

function getItemById(id) {
    return new Promise((resolve, reject) => {
        reject(); // RETURN "EMPTY" PROMISE
    });
}

// Export functions to be used in server.js
module.exports = { initialize, getAllItems, getPublishedItems, getPublishedItemsByCategory, getCategories, addItem, getItemsByCategory, getItemsByMinDate, getItemById };
