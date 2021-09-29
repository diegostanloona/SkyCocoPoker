const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const short = require('short-uuid');
const cards = require('../cards');

const Game = require('../models/game');
const User = require('../models/user');
const Player = require('../models/player');

const getGame = async (req, res, next) => {
  const gameId = req.params.gid;

  let existingGame;
  try {
    existingGame = await Game.findById(gameId).populate('players').lean();
  } catch (e) {
    const error = new HttpError('Error finding the game.', 500);
    return next(error);
  }

  res.json({ game: existingGame });
}

const createGame = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        return next(new HttpError('Error reading the data.', 422));
    }


    const communityCards = [];

    while(communityCards.length<5){
      const randomNumber = Math.floor(Math.random() * (50 - 0 + 1) + 0);
      if(!communityCards.includes(randomNumber)){
        communityCards.push(randomNumber);
      }
    }

    const userId = req.userData.userId;
    const { cardsQuantity } = req.body;
    const date = new Date().toISOString().split('T')[0];
    const code = short.generate();
    const status = "created";

    const createdGame = new Game({
      round1: [cards[communityCards[0]], cards[communityCards[1]], cards[communityCards[2]]],
      round2: cards[communityCards[3]],
      round3: cards[communityCards[4]],
      date: date,
      code: code,
      status: status,
      host: userId,
      cardsQuantity: cardsQuantity,
      communityCards: communityCards,
      turn: 0,
      round: 0
    });

    const playerCards = [];

    while(playerCards.length<cardsQuantity){
      const randomNumber = Math.floor(Math.random() * (50 - 0 + 1) + 0);
      if(!communityCards.includes(randomNumber)){
        playerCards.push(cards[randomNumber]);
      }
    }

    const createdPlayer = new Player({
      user: userId,
      turn: 0,
      status: 'waiting',
      bet: 0,
      givenCards: playerCards
    });

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdGame.save({ session: sess });
        createdPlayer.game = createdGame;
        await createdPlayer.save({ session: sess });
        await sess.commitTransaction();
    } catch (e) {
        console.log(e);
        const error = new HttpError('Error while creating new game.', 500);
        return next(error);
    }

    res.json({ game: createdGame, player: createdPlayer });
};

const joinGame = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      console.log(errors);
      return next(new HttpError('Error reading the data.', 422));
  }
  const gameCode = req.params.gid;

  const userId = req.userData.userId;

  let existingGame;
  try {
      existingGame = await Game.findOne({code: gameCode});
  } catch (e) {
      console.log("Could not find Game, error: " + e);
      const error = new HttpError('Error while finding the game.', 500);
      return next(error);
  }

  if(!existingGame){
    const error = new HttpError('Error while finding the game.', 500);
    return next(error);
  }

  if(existingGame.status !== 'created'){
    const error = new HttpError('Game already started or finished.', 500);
    return next(error);
  }

  const playerCards = [];

  while(playerCards.length<existingGame.cardsQuantity){
    const randomNumber = Math.floor(Math.random() * (50 - 0 + 1) + 0);
    if(!existingGame.communityCards.includes(randomNumber)){
      playerCards.push(cards[randomNumber]);
    }
  }

  const createdPlayer = new Player({
    user: userId,
    game: existingGame,
    turn: 0,
    status: 'waiting',
    bet: 0,
    givenCards: playerCards
  });

  try {
      await createdPlayer.save();
  } catch (e) {
      console.log(e);
      const error = new HttpError('Error while creating new player.', 500);
      return next(error);
  }

  res.json({ player: player });
}

const updateGameStatus = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      console.log(errors);
      return next(new HttpError('Error reading the data.', 422));
  }

  const gameId = req.params.gid;
  const { status } = req.body;

  let existingGame;
  try {
      existingGame = await Game.findById(gameId);
  } catch (e) {
      console.log("Could not find Game, error: " + e);
      const error = new HttpError('Error while finding the game.', 500);
      return next(error);
  }

  existingGame.status = status;

  try {
      await existingGame.save();
  } catch (e) {
      console.log(e);
      const error = new HttpError('Error while updating game.', 500);
      return next(error);
  }

  res.json({ game: existingGame });
}

const bet = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      console.log(errors);
      return next(new HttpError('Error reading the data.', 422));
  }

  const playerId = req.params.pid;
  const { bet } = req.body;

  let existingPlayer;
  try {
      existingPlayer = await Player.findById(playerId);
  } catch (e) {
      console.log("Could not find Player, error: " + e);
      const error = new HttpError('Error while finding Player.', 500);
      return next(error);
  }

  try {
      await existingPlayer.save();
  } catch (e) {
      console.log(e);
      const error = new HttpError('Error while updating Player.', 500);
      return next(error);
  }

  let existingGame;
  try {
    existingGame = await Game.findById(existingPlayer.game).populate('players').lean();
  } catch (e) {
    console.log("Could not find Game, error: " + e);
    const error = new HttpError('Error while finding Game.', 500);
    return next(error);
  }

  if(existingGame.round !== 2){
    existingPlayer.bet += bet;
  }else{
    const error = new HttpError('Can not bet in this round.', 500);
    return next(error);
  }

  if(existingGame.round === 0 && existingGame.turn === 0){
    game.status = 'started';
  }

  if(existingGame.turn !== existingPlayer.turn){
    const error = new HttpError('You must wait to the other players.', 500);
    return next(error);
  }

  if(existingGame.turn === existingGame.players.length){
      existingGame.round++;
      existingGame.players.forEach(item => {
        game.totalBets+=bet;
      })
  }else{
    existingGame.turn++;
  }
  //Al guardar se aumenta game.turn en 1 y si llega al máximo se aumenta game.round
  //y se suman las apuestas totales, si es el más alto se bloquean las apuestas

  try {
    //Guardar
  } catch (e) {
    console.log("Error saving" + e);
    const error = new HttpError('Error while saving bet.', 500);
    return next(error);
  }


  res.json({ player: existingPlayer, turn: existingGame.turn, round: existingGame.round });
}

const fold = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      console.log(errors);
      return next(new HttpError('Error reading the data.', 422));
  }

  const playerId = req.params.pid;

  let existingPlayer;
  try {
      existingPlayer = await Player.findById(playerId);
  } catch (e) {
      console.log("Could not find Player, error: " + e);
      const error = new HttpError('Error while finding Player.', 500);
      return next(error);
  }

  existingPlayer.status = 'fold';

  try {
      await existingPlayer.save();
  } catch (e) {
      console.log(e);
      const error = new HttpError('Error while updating Player.', 500);
      return next(error);
  }

  res.json({ player: existingPlayer });
}

const selectCards = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      console.log(errors);
      return next(new HttpError('Error reading the data.', 422));
  }

  const { cards } = req.body;

  const playerId = req.params.pid;

  let existingPlayer;
  try {
      existingPlayer = await Player.findById(playerId);
  } catch (e) {
      console.log("Could not find Player, error: " + e);
      const error = new HttpError('Error while finding Player.', 500);
      return next(error);
  }

  existingPlayer.finalCards = [...existingPlayer.givenCards, ...cards];

  try {
      await existingPlayer.save();
  } catch (e) {
      console.log(e);
      const error = new HttpError('Error while updating Player.', 500);
      return next(error);
  }

  res.json({ player: existingPlayer });
}

const chooseWinner = async (req, res, next) => {
  //iterar cada player y comparar
  res.json({ winner: "Diego" });
}

exports.getGame = getGame;
exports.createGame = createGame;
exports.joinGame = joinGame;
exports.updateGameStatus = updateGameStatus;
exports.chooseWinner = chooseWinner;
exports.bet = bet;
exports.fold = fold;
exports.selectCards = selectCards;
