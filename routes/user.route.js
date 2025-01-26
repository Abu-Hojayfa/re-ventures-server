
const user = require('../controllers/user.controller');


const express = require('express');
const router = express.Router();

router.post('/', user.createUser);
router.get('/getAllUsers', user.getAllUsers);
router.get('/getUserById/:id', user.getUserById);
router.put('/updateUserById/:id', user.updateUserById);
router.delete('/deleteUserById/:id', user.deleteUserById);


module.exports = router;