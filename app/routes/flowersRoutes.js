const express = require('express');
const router = express.Router();
const flowersController = require('../controllers/flowersController');

router.get('/', flowersController.getAllFlowers);
router.get('/:id', flowersController.getInfoBySpecificFlowers);
router.post('/buy/:id', flowersController.buyFlowers);
router.get('/buy/success', flowersController.success);
router.get('/buy/cancel', flowersController.cancel);
router.post('/sendFlowerTo/:id', flowersController.sendFlowerTo);

module.exports = router;