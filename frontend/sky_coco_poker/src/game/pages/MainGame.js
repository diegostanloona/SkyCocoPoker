import React, { useState, useContext, useEffect } from 'react';

import Modal from '../../shared/components/UIElements/Modal';
import CommunityCard from '../components/CommunityCard';

import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';

import { io } from "socket.io-client";

import './MainGame.css';

const MainGame = props => {

  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const auth = useContext(AuthContext);

  const [areCardsShown, setAreCardsShown] = useState(false);
  const [bet, setBet] = useState(0);
  const [selectedCards, setSelectedCards] = useState([]);

  const currentPlayer = props.gameData.existingGame.players.filter(item => item.user === auth.userId)[0];

  const closeCardsHandler = () => {
    setAreCardsShown(false);
  }

  const onInputChangeHandler = e => {
    setBet(e.target.value);
  }

  const betHandler = async () => {
    try{
      const responseData = await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/api/games/bet/${props.gameData.existingPlayer._id}`,
        'POST',
        JSON.stringify({
          bet: parseInt(bet)
        }),
        {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer '+auth.token
        }
      );
    }catch(e){
      console.log(e);
    }
  }

  const foldHandler = async () => {
    try{
      const responseData = await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/api/games/fold/${props.gameData.existingPlayer._id}`,
        'POST',
        JSON.stringify({
        }),
        {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer '+auth.token
        }
      );
    }catch(e){
      console.log(e);
    }
  }

  try {
    const socket = io('http://localhost:5000');

    socket.on('gameUpdate'+props.gameData.existingGame._id, (e) => {
      props.refreshHandler();
    });
  } catch (e) {

  }

  const selectCardHandler = (card, setIsCardSelected) => {
    if(props.gameData.existingPlayer.status === 'playing'){
      if(selectedCards.length <= 4 - props.gameData.existingPlayer.givenCards.length){
        setSelectedCards([...selectedCards, card]);
        setIsCardSelected(true);
      }
    }

  }

  const unselectCardHandler = (card, setIsCardSelected) => {
    if(props.gameData.existingPlayer.status === 'playing'){
      const pivotCards = [...selectedCards].filter(i => i.index !== card.index);
      setIsCardSelected(false);
      setSelectedCards(pivotCards);
    }
  }

  const selectFinalCardsHandler = async () => {
    try{
      const responseData = await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/api/games/selectCards/${props.gameData.existingPlayer._id}`,
        'POST',
        JSON.stringify({
          cards: selectedCards
        }),
        {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer '+auth.token
        }
      );
      props.refreshHandler();
      try {
        const winningSocket = io('http://localhost:5000');

        winningSocket.on('gameWinner'+props.gameData.existingGame._id, (e) => {
          console.log(e);
        });
      } catch (e) {
        console.log(e);
      }
    }catch(e){
      console.log(e);
    }
  }


  return (
    <>
    {
      error && <ErrorModal error={error} onClear={clearError} />
    }
    {
      isLoading && <LoadingSpinner asOverlay />
    }
    <div className="game">
          <h2 className="turn">{(props.gameData.existingGame.round === 0 && 'Flop') || (props.gameData.existingGame.round === 1 && 'Turn') || (props.gameData.existingGame.round === 2 && 'River')}</h2>
          <div className="community_cards">
            <span>Room code: {props.gameData.existingGame.code}</span><br/>
            <span>COMMUNITY CARDS</span>
              <CommunityCard card={props.gameData.existingGame.round1[0]} selectCardHandler={selectCardHandler} unselectCardHandler={unselectCardHandler}/>
              <CommunityCard card={props.gameData.existingGame.round1[1]} selectCardHandler={selectCardHandler} unselectCardHandler={unselectCardHandler}/>
              <CommunityCard card={props.gameData.existingGame.round1[2]} selectCardHandler={selectCardHandler} unselectCardHandler={unselectCardHandler}/>
            {
              props.gameData.existingGame.round >= 1 &&
              <CommunityCard card={props.gameData.existingGame.round2} selectCardHandler={selectCardHandler} unselectCardHandler={unselectCardHandler}/>
            }
            {
              props.gameData.existingGame.round >= 2 &&
              <CommunityCard card={props.gameData.existingGame.round3} selectCardHandler={selectCardHandler} unselectCardHandler={unselectCardHandler}/>
            }
          </div>
          {
            props.gameData.existingPlayer.status === 'playing' &&
            <div className="bet-input">
              <input type="number" placeholder="Type your bet" onChange={onInputChangeHandler}/>
              <button onClick={betHandler}>Bet</button>
              <button className="danger" onClick={foldHandler}>Fold</button>
              {
                props.gameData.existingGame.round >= 3 &&
                <button onClick={selectFinalCardsHandler}>Select Cards</button>

              }
            </div>
          }
          {
            props.gameData.existingPlayer.status === 'fold' &&
            <div className="bet-input">
              <h6>You can't play after folding.</h6>
            </div>
          }
          <div className="gameInfo">
            <h4>Now playing: {props.gameData.existingGame.players.filter(i => i.turn === props.gameData.existingGame.turn)[0].name}</h4>
            <h5>Total bet: {props.gameData.existingGame.totalBets}</h5>
          </div>
          <div className="players_list">
            {
              props.gameData.otherPlayers.map(item => {
                return(
                  <div className={`player_item ${item._id === props.gameData.existingPlayer._id ? 'you' : ''}`}>
                    <h4>{item._id === props.gameData.existingPlayer._id ? 'You' : item.name}</h4>
                    <h5>Bet: {item.bet}</h5>
                    <h6 className="waiting">{item.status}</h6>
                  </div>
                )
              })
            }
          </div>
          <Modal show={areCardsShown} onCancel={closeCardsHandler}>
            <div className="cards">
              {
                props.gameData.existingPlayer.givenCards.map(item =>
                    <img src={`images/cards/${item.value}_of_${item.suit}.png`} alt=""/>
                )
              }
            </div>
      		</Modal>
          <div className="bottom-bar" onClick={() => setAreCardsShown(true)}>
            <h4>Show cards</h4>
          </div>

    </div>
    </>
  );
};

export default MainGame;
