const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const userRoutes = require('./app/routes/userRoutes');

app.use('/users', userRoutes);

app.use(express.static('public'));

app.use((req, res, next) => {
    res.status(404).send('Sorry, we cannot find that');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

