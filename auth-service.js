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

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
    userName: {
        type: String,
        unique: true
    },
    password: String,
    email: String,
    loginHistory: [{
        dateTime: Date,
        userAgent: String
    }]
});

let User; // to be defined on new connection (see initialize)

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection(process.env.MONGODB_CONN_STRING);

        db.on('error', (err) => {
            reject(err); // reject the promise with the provided error
        });
        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve();
        });
    });
};

module.exports.registerUser = function(userData) {
    return new Promise((resolve, reject) => {
        // Password mismatch validation
        if (userData.password !== userData.password2) {
            reject("Passwords do not match");
            return;
        }

        // Create a new User instance using only necessary fields
        let newUser = new User({
            userName: userData.userName,
            password: userData.password,
            email: userData.email,
            loginHistory: []
        });

        // Save the new user
        newUser.save()
            .then(() => {
                resolve(); // No error
            })
            .catch(err => {
                if (err.code === 11000) {
                    reject("User Name already taken");
                } else {
                    reject("There was an error creating the user: " + err);
                }
            });
    });
};

module.exports.checkUser = function(userData) {
    return new Promise((resolve, reject) => {
        // Find user by userName
        User.findOne({ userName: userData.userName })
            .then(user => {
                if (!user) {
                    reject("Unable to find user: " + userData.userName);
                } else if (user.password !== userData.password) {
                    reject("Incorrect Password for user: " + userData.userName);
                } else {
                    // Push new loginHistory
                    user.loginHistory.push({
                        dateTime: (new Date()).toString(),
                        userAgent: userData.userAgent
                    });

                    // Save updated login history
                    User.updateOne(
                        { userName: user.userName },
                        { $set: { loginHistory: user.loginHistory } }
                    )
                    .then(() => {
                        resolve(user);
                    })
                    .catch(err => {
                        reject("There was an error verifying the user: " + err);
                    });
                }
            })
            .catch(err => {
                reject("Unable to find user: " + userData.userName);
            });
    });
};
