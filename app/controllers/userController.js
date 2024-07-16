const User = require('../models/user');

exports.getAllUsers = (req, res) => {
    console.log("dewe");
    res.send('Get all users');
};

exports.createUser = (req, res) => {
    res.send('Create user');
};

exports.getUserById = (req, res) => {
    res.send('Get user by ID');
};

exports.updateUser = (req, res) => {
    res.send('Update user');
};

exports.deleteUser = (req, res) => {
    res.send('Delete user');
  };