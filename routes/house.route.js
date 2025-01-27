const express = require('express');
const houseController = require('../controllers/house.controller'); // Updated to reflect the correct controller
const router = express.Router();

router.post('/create', houseController.createHouse);
router.get('/lists', houseController.findAllHouses);
router.get('/details/:house_id', houseController.findHouseById);
router.put('/update/:house_id', houseController.updateHouseById);
router.delete('/delete/:house_id', houseController.deleteHouse);
router.get('/propertyDetails', houseController.getPropertyDetails);
router.get('/propertyDetails/:house_id', houseController.getPropertyDetailsById);

router.get('/homeDetails/:type', houseController.getPropertyDetailsByType);
router.get('/owner/:user_id', houseController.findHousesByOwner);

module.exports = router;
