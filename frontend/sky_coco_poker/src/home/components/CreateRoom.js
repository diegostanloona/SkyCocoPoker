import React, { useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';

import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';

import './CreateRoom.css';

const CreateRoom = () => {

  const auth = useContext(AuthContext);

  const history = useHistory();

  const [cardsNumber, setCardsNumber] = useState(2);

  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const decreaseCards = () => {
    setCardsNumber(2);
  };

  const increaseCards = () => {
    setCardsNumber(3);
  };

  const createRoom = async () => {
    try{
      const responseData = await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/api/games/createGame`,
        'POST',
        JSON.stringify({
          cardsQuantity: cardsNumber
        }),
        {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer '+auth.token
        }
      );
      history.push("/game");
    }catch(e){
      console.log(e);
    }

  }

  return(
    <>
    {
      error && <ErrorModal error={error} onClear={clearError} />
    }
    {
      isLoading && <LoadingSpinner asOverlay />
    }
    <div className="create_room">
      <h3>Select number of cards</h3>
      <span onClick={decreaseCards}>-</span>
      <h5>{cardsNumber}</h5>
      <span onClick={increaseCards}>+</span>

      <br/>
      <button onClick={createRoom}>CREATE ROOM</button>
    </div>
    </>
  );
}

export default CreateRoom;
