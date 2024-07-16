const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const userRoutes = require("./app/routes/userRoutes");
const flowersRoutes = require("./app/routes/flowersRoutes");
const morgan = require('morgan');

dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/users", userRoutes);
app.use("/flowers", flowersRoutes);

app.use(express.static("public"));

app.use(morgan('dev'));

app.use((req, res, next) => {
  res.status(404).send("Sorry, we cannot find that");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
