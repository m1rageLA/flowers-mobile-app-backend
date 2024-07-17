const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const secretKey = process.env.JWT_SECRET;

const User = require("../models/user");

exports.register = async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully', uniqueId: newUser.uniqueId });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).send("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("Invalid credentials");

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token, uniqueId: user.uniqueId });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

exports.getAllUsers = (req, res) => {
  res.send("Get all users");
};

exports.createUser = (req, res) => {
  res.send("Create user");
};

exports.updateUser = (req, res) => {
  res.send("Update user");
};

exports.deleteUser = (req, res) => {
  res.send("Delete user");
};
