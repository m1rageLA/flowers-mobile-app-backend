const express = require('express');
const router = express.Router();
const flowersController = require('../controllers/flowersController');

router.get('/', flowersController.getAllFlowers);
router.get('/:id', flowersController.getInfoBySpecificFlowers);

module.exports = router;