const express = require('express');
const { check } = require('express-validator');
const gamesController = require('../controllers/games-controller');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.use(checkAuth);

router.post('/getGame', gamesController.getGame);

router.post('/createGame', gamesController.createGame);

router.post('/joinGame', gamesController.joinGame);

router.post('/updateGameStatus/:gid', gamesController.updateGameStatus);

router.post('/bet/:pid', gamesController.bet);

router.post('/fold/:pid', gamesController.fold);

router.post('/selectCards/:pid', gamesController.selectCards);

router.post('/chooseWinner/:gid', gamesController.chooseWinner);

module.exports = router;
