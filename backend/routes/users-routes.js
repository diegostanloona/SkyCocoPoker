const express = require('express');
const { check } = require('express-validator');
const usersController = require('../controllers/users-controller');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.post('/login', usersController.login);

router.post('/signup', usersController.signup);

router.use(checkAuth);

router.get('/:uid', usersController.getUser);



module.exports = router;
