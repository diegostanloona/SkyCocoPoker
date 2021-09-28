const express = require('express');
const { check } = require('express-validator');
const gamesController = require('../controllers/games-controller');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.use(checkAuth);

router.get('/:gid', gamesController.getGame);

router.post('/createGame', gamesController.createGame);

router.post('/joinGame/:gid', gamesController.joinGame);

router.post('/updateGameStatus/:gid', gamesController.updateGameStatus);

router.post('/chooseWinner/:gid', gamesController.chooseWinner);

//Players

router.post('/bet/:pid', gamesController.bet);

router.post('/fold/:pid', gamesController.fold);

router.post('/selectCards/:pid', gamesController.selectCards);


module.exports = router;
