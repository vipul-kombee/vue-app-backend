const express = require('express');
const router = express.Router();
const UserController = require('./user.controller');

router.post('/signup', UserController.register);
router.post('/signin', UserController.login);

module.exports = router;