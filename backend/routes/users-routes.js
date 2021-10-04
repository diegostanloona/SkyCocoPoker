const express = require('express');
const { check } = require('express-validator');
const usersController = require('../controllers/users-controller');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.post('/login', usersController.login);

router.post('/signup', usersController.signup);

router.get('/:uid', usersController.getUser);

router.get('/history/:uid', usersController.getPlayerHistory);

module.exports = router;
