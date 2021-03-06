const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const short = require('short-uuid');
const PokerEvaluator = require('poker-evaluator');

const { cards } = require('../cards');
const HttpError = require('../models/http-error');

const Game = require('../models/game');
const User = require('../models/user');
const Player = require('../models/player');

const io = require('../util/socket');

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


    const playerCards = [];

    while(playerCards.length<cardsQuantity){
      const randomNumber = Math.floor(Math.random() * (50 - 0 + 1) + 0);
      if(!communityCards.includes(randomNumber)){
        playerCards.push(cards[randomNumber]);
      }
    }

    let existingUser;

    try {
      existingUser = await User.findById(userId);
    } catch (e) {
      const error = new HttpError('Error finding user.', 500);
      return next(error);
    }

    const createdPlayer = new Player({
      user: userId,
      name: existingUser.name,
      turn: 0,
      status: 'playing',
      bet: 0,
      givenCards: playerCards
    });

    const createdGame = new Game({
      players: [createdPlayer],
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
      round: 0,
      totalBets: 0
    });

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdPlayer.save({ session: sess });
        await createdGame.save({ session: sess });
        await sess.commitTransaction();
    } catch (e) {
      console.log(e);
        const error = new HttpError('Error while creating new game.', 500);
        return next(error);
    }

    res.json({ code: createdGame.code });
};

const getGame = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      console.log(errors);
      return next(new HttpError('Error reading the data.', 422));
  }

  const userId = req.userData.userId;
  let existingGame;
  let existingPlayer;

  try {
      existingGame = await Game.findOne({ 'games.players.user': userId, status: {$ne: 'finished'} }).populate('players');
  } catch (e) {
      console.log("Could not find Game, error: " + e);
      const error = new HttpError('Error while finding the game.', 500);
      return next(error);
  }

  if(!existingGame){
    console.log("game undefined");
    const error = new HttpError('Error while finding the game.', 500);
    return next(error);
  }

  const playerId = existingGame.players.filter(player => String(player.user) === String(userId))[0]._id;

  console.log(playerId);

  try {
      existingPlayer = await Player.findOne({_id: playerId});
  } catch (e) {
    console.log("player.find");
      const error = new HttpError('Error while finding the game.', 500);
      return next(error);
  }

  if(existingGame.status === 'finished'){
    const error = new HttpError('Game already finished.', 500);
    return next(error);
  }

  if(existingPlayer.turn === existingGame.turn && existingPlayer.status === 'fold'){
    if(existingGame.turn === existingGame.players.length-1){
        existingGame.round++;
        existingGame.turn = 0;
    }else{
      existingGame.turn++;
    }
    try {
      io.getIO().emit('gameUpdate'+existingGame._id, {});


    } catch (e) {
      console.log(e);
    }
  }

  try {
      await existingGame.save();
  } catch (e) {
      console.log(e);
      const error = new HttpError('Error while updating game.', 500);
      return next(error);
  }

  res.json({ existingGame: existingGame, existingPlayer: existingPlayer, otherPlayers: existingGame.players });
};

const joinGame = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      console.log(errors);
      return next(new HttpError('Error reading the data.', 422));
  }

  const userId = req.userData.userId;

  const { gameCode } = req.body;

  let existingGame;

  try {
      existingGame = await Game.findOne({ code: gameCode }).populate('players');
  } catch (e) {
      console.log("Could not find Game, error: " + e);
      const error = new HttpError('Error while finding the game.', 500);
      return next(error);
  }

  if(!existingGame){
    console.log("game undefined");
    const error = new HttpError('Error while finding the game.', 500);
    return next(error);
  }

  if(existingGame.status !== 'created'){
    console.log("game not created");
    const error = new HttpError('Game already started or finished.', 500);
    return next(error);
  }

  if(existingGame.players.length >= 15){
    const error = new HttpError('Too many players.', 500);
    return next(error);
  }

  let playerFound = false;

  existingGame.players.forEach(item => {
    if(item.user._id == userId){
      playerFound = true;
    }
  });

  if(playerFound){
    const error = new HttpError('Player is already in this room.', 500);
    return next(error);
  }

  let existingUser;

  try {
    existingUser = await User.findById(userId);
  } catch (e) {
    const error = new HttpError('Error finding user.', 500);
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
    name: existingUser.name,
    turn: existingGame.players.length,
    status: 'playing',
    bet: 0,
    givenCards: playerCards
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlayer.save({ session: sess });
    existingGame.players.push(createdPlayer);
    await existingGame.save({ session: sess });
    await sess.commitTransaction();
  } catch (e) {
      console.log(e);
      const error = new HttpError('Error while creating new player.', 500);
      return next(error);
  }

  io.getIO().emit('gameUpdate'+existingGame._id, {});



  res.json({ game: existingGame });
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
      console.log("Update - Could not find Game, error: " + e);
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

  const userId = req.userData.userId;
  const playerId = req.params.pid;
  const { bet } = req.body;

  let existingPlayer;
  try {
    existingPlayer = await Player.findOne({ user: userId, status: 'playing' });
  } catch (e) {
      console.log("Could not find Player, error: " + e);
      const error = new HttpError('Error while finding Player.', 500);
      return next(error);
  }

  if(existingPlayer.status !== 'playing'){
    const error = new HttpError('You are not able to bet in this game.', 500);
    return next(error);
  }

  let existingGame;
  try {
    existingGame = await Game.findOne({ 'games.players.user': userId, status: {$ne: 'finished'} }).populate('players');
  } catch (e) {
    console.log("Could not find Game, error: " + e);
    const error = new HttpError('Error while finding Game.', 500);
    return next(error);
  }

  if(existingGame.turn !== existingPlayer.turn){
    const error = new HttpError('you must wait for the other players.', 500);
    return next(error);
  }

  if(existingGame.round !== 3){
    existingPlayer.bet += bet;
    existingGame.totalBets+=bet;
  }else{
    const error = new HttpError('Can not bet in this round.', 500);
    return next(error);
  }

  if(existingGame.round === 0 && existingGame.turn === 0){
    existingGame.status = 'started';
  }

  if(existingGame.turn === existingGame.players.length-1){
      existingGame.round++;
      existingGame.turn = 0;
  }else{
    existingGame.turn++;
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await existingGame.save({ session: sess });
    await existingPlayer.save({ session: sess });
    await sess.commitTransaction();
  } catch (e) {
    console.log("Error saving" + e);
    const error = new HttpError('Error while saving bet.', 500);
    return next(error);
  }

  io.getIO().emit('gameUpdate'+existingGame._id, {});


  //console.log('gameUpdate'+existingGame._id);

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

  if(existingPlayer.status !== 'playing' && existingPlayer.status !== 'fold'){
    const error = new HttpError('You are not able to fold in this game.', 500);
    return next(error);
  }

  let existingGame;

  try {
    existingGame = await Game.findOne({ 'games.players.user': existingPlayer.user, status: {$ne: 'finished'} }).populate('players');
  } catch (e) {
    console.log("Could not find Game, error: " + e);
    const error = new HttpError('Error while finding Game.', 500);
    return next(error);
  }

  const players = [...existingGame.players.filter(player => String(player._id) !== String(playerId))];

  let isEveryoneFold = true;

  players.forEach(player => {
    if(player.status !== 'fold'){
      isEveryoneFold = false;
    }
  });

  if(isEveryoneFold){
    const error = new HttpError('You are not able to fold because you are the last player standing.', 500);
    return next(error);
  }


  if(existingGame.turn !== existingPlayer.turn){
    const error = new HttpError('you must wait for the other players.', 500);
    return next(error);
  }

  if(existingGame.round === 3){
    const error = new HttpError('Can not fold in this round.', 500);
    return next(error);
  }


  if(existingGame.round === 0 && existingGame.turn === 0){
    existingGame.status = 'started';
  }

  if(existingGame.turn === existingGame.players.length-1){
      existingGame.round++;
      existingGame.turn = 0;
  }else{
    existingGame.turn++;
  }

  if(existingPlayer.status === 'fold'){
    try {
      await existingGame.save();
    } catch (e) {
      console.log(e);
      const error = new HttpError('Error while updating the game.', 500);
      return next(error);
    }
  }else{
    existingPlayer.status = 'fold';
    existingPlayer.finalCards = [{ index: 5, suit: 'diamonds', value: '2' }, { index: 14, suit: 'hearts', value: '4' }, { index: 8, suit: 'clubs', value: '3' }, { index: 19, suit: 'spades', value: '5' }, { index: 21, suit: 'diamonds', value: '6' }];

    try {
      const sess = await mongoose.startSession();
      sess.startTransaction();
      await existingGame.save({ session: sess });
      await existingPlayer.save({ session: sess });
      await sess.commitTransaction();
    } catch (e) {
        console.log(e);
        const error = new HttpError('Error while updating Player.', 500);
        return next(error);
    }
  }

  io.getIO().emit('gameUpdate'+existingGame._id, {});



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

  if(existingPlayer.status !== 'playing'){
    const error = new HttpError('You are not able to select cards multiple times.', 500);
    return next(error);
  }

  if(cards.length + existingPlayer.givenCards.length !== 5){
    const error = new HttpError('You must select 5 cards in total.', 500);
    return next(error);
  }

  existingPlayer.finalCards = [...existingPlayer.givenCards, ...cards];
  existingPlayer.status = 'cardsSelected';

  try {
      await existingPlayer.save();
  } catch (e) {
      console.log(e);
      const error = new HttpError('Error while updating Player.', 500);
      return next(error);
  }
    res.json({});
}

const chooseWinner = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      console.log(errors);
      return next(new HttpError('Error reading the data.', 422));
  }

  const gameId = req.params.gid;

  let existingGame;

  try {
    existingGame = await Game.findById(gameId).populate('players');
  } catch (e) {
    console.log("Choose - Could not find Game, error: " + e);
    const error = new HttpError('Error while finding Game.', 500);
    return next(error);
  }

  existingGame.players.forEach(player => {
    if(player.finalCards.length !== 5){
      const error = new HttpError('All players have to select their cards before checking for a winner.', 500);
      return next(error);
    }
  });

  let existingPlayer;

  const winner = await chooseWinnerHandler(existingGame);
  try {
    existingPlayer = await Player.findById(winner.id);
  } catch (e) {
    console.log("Winner - Could not find Game, error: " + e);
    const error = new HttpError('Error while finding Game.', 500);
    return next(error);
  }


  existingPlayer.status = 'winner';
  existingGame.status = 'finished';

  try {
      await existingPlayer.save();
      await existingGame.save();
  } catch (e) {
      console.log(e);
      const error = new HttpError('Error while updating Player.', 500);
      return next(error);
  }
  try {
    io.getIO().emit('gameFinished'+existingGame._id, {winner: existingPlayer});

  } catch (e) {
    console.log(e);
  }

  res.json({ player: existingPlayer });

}

const cardsFormatter = cards => {
  let newCards = [];

  cards.forEach(card => {
    const suit = card.suit[0];
    let value;

    if(card.value.length !== 2){
      value = card.value[0].toUpperCase();
    }else{
      value = 'T'
    }

    const newCard = value+suit;

    newCards.push(newCard);

  });

  return newCards;
}

const chooseWinnerHandler = async (existingGame) => {

  let winner;

  const players = [];

  existingGame.players.forEach(player => {
    players.push({
      id: player._id,
      calculatedScore: player.status==='fold'? {value: -99999} : PokerEvaluator.evalHand(cardsFormatter(player.finalCards))
    });
  });

  const maxScore = Math.max.apply(Math, players.map(player => player.calculatedScore.value));

  winner = players.find(player => player.calculatedScore.value === maxScore);

  return winner;

}

exports.getGame = getGame;
exports.createGame = createGame;
exports.joinGame = joinGame;
exports.updateGameStatus = updateGameStatus;
exports.bet = bet;
exports.fold = fold;
exports.selectCards = selectCards;
exports.chooseWinner = chooseWinner;
