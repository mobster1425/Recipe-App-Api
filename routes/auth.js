const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/auth');




const { register, login,updateUser } = require('../controller/User');

router.post('/register', register);
router.post('/login', login);
router.patch('/updateUser',authenticateUser,updateUser);

module.exports = router;