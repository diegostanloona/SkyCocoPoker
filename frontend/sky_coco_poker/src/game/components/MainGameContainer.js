import React, {useState, useEffect, useContext} from 'react';

import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';

import MainGame from '../pages/MainGame';

const MainGameContainer = () => {
  const auth = useContext(AuthContext);

  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [gameData, setGameData] = useState();

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
        // setExistingGame(responseData.existingGame);
        // setExistingPlayer(responseData.existingPlayer);
        // setOtherPlayers(responseData.otherPlayers);
        setGameData(responseData);
      }catch(e){
        console.log(e);
      }
    };
    checkGame();
  }, []);

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
      // setExistingGame(responseData.existingGame);
      // setExistingPlayer(responseData.existingPlayer);
      // setOtherPlayers(responseData.otherPlayers);
      setGameData(responseData);
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
      !gameData && isLoading && <LoadingSpinner asOverlay />
    }
    {
      !isLoading && gameData && <MainGame gameData={gameData} refreshHandler={refreshHandler}/>
    }
    {
      !gameData && <h2>You are not in a game.</h2>
    }
    </>
  )
};

export default MainGameContainer;
