import React, {useState, useEffect, useContext} from 'react';

import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';

import openSocket from "socket.io-client";

import MainGame from '../pages/MainGame';

const MainGameContainer = () => {
  const auth = useContext(AuthContext);

  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [gameData, setGameData] = useState();

  const refreshHandler = async () => {
    try{
      const responseData = await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/api/games/getGame`,
        'POST',
        JSON.stringify({
        }),
        {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer '+auth.token
        }
      );
      setGameData(responseData);
    }catch(e){
      console.log(e);
    }
  }

  useEffect(() => {
    const checkGame = async () => {
      try{
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/api/games/getGame`,
          'POST',
          JSON.stringify({
          }),
          {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer '+auth.token
          }
        );
        setGameData(responseData);
      }catch(e){
        console.log(e);
      }
    };
    checkGame();

  }, []);





  return(
    <>
    {
      error && <ErrorModal error={error} onClear={clearError} />
    }
    {
      isLoading && <LoadingSpinner asOverlay />
    }
    {
      !isLoading && gameData && <MainGame gameData={gameData} refreshHandler={refreshHandler}/>
    }
    {
      !gameData && <h2 align='center'>You are not in a game.</h2>
    }
    </>
  )
};

export default MainGameContainer;
