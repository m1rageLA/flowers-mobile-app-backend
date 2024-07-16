const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const secretKey = process.env.JWT_SECRET;
const Flowers = require("../models/flowers");

exports.getAllFlowers = async (req, res) => {
  try {
    const flowers = await Flowers.find();
    res.status(200).json(flowers);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving flowers");
  }
};
exports.getInfoBySpecificFlowers = async (req, res) => {
  const { id } = req.params;
  try {
    const flower = await Flowers.findById(id);
    if (!flower) {
        return res.status(404).json({ message: "Flower is not found" });
    }
    res.status(200).json(flower);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving flower information");
  }
};
