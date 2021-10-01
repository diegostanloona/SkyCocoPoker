import React, { useState, useContext, useEffect } from 'react';

import Modal from '../../shared/components/UIElements/Modal';

import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';

import { io } from "socket.io-client";

import './MainGame.css';

const MainGame = props => {

  console.log(props);

  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const auth = useContext(AuthContext);

  const [areCardsShown, setAreCardsShown] = useState(false);
  const [bet, setBet] = useState(0);

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
      console.log(responseData);
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
      console.log(responseData);
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



  console.log(props.gameData.existingPlayer);

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
            <img src={`images/cards/${props.gameData.existingGame.round1[0].value}_of_${props.gameData.existingGame.round1[0].suit}.png`} alt=""/>
            <img src={`images/cards/${props.gameData.existingGame.round1[1].value}_of_${props.gameData.existingGame.round1[1].suit}.png`} alt=""/>
            <img src={`images/cards/${props.gameData.existingGame.round1[2].value}_of_${props.gameData.existingGame.round1[2].suit}.png`} alt=""/>
            {
              props.gameData.existingGame.round >= 1 &&
              <img src={`images/cards/${props.gameData.existingGame.round2.value}_of_${props.gameData.existingGame.round2.suit}.png`} alt=""/>
            }
            {
              props.gameData.existingGame.round >= 2 &&
              <img src={`images/cards/${props.gameData.existingGame.round3.value}_of_${props.gameData.existingGame.round3.suit}.png`} alt=""/>
            }
          </div>
          <div className="bet-input">
            <input type="number" placeholder="Type your bet" onChange={onInputChangeHandler}/>
            <button onClick={betHandler}>Bet</button>{/*apostar*/}
            <button className="danger" onClick={foldHandler}>Fold</button>
          </div>
          <div className="gameInfo">
            <h4>Now playing: {props.gameData.existingGame.players.filter(i => i.turn === props.gameData.existingGame.turn)[0].name}</h4>
            <h5>Total bet: {props.gameData.existingGame.totalBets}</h5>
          </div>
          <div className="players_list">
            {
              props.gameData.otherPlayers.map(item => {
                console.log(item);
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
