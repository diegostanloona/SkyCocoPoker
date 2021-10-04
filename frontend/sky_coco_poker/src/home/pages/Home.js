import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';

import Modal from '../../shared/components/UIElements/Modal';
import CreateRoom from '../components/CreateRoom';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';

import './Home.css';

const Home = () => {

  const auth = useContext(AuthContext);
  const [isCreateRoomShown, setIsCreateRoomShown] = useState(false);
  const [gameCode, setGameCode] = useState("");

  const history = useHistory();

  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const closeCreateRoomHandler = () => {
    setIsCreateRoomShown(false);
  }

  const enterRoom = async () => {
    try{
      const responseData = await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/api/games/joinGame`,
        'POST',
        JSON.stringify({
          gameCode: gameCode
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
  };

  const onInputChangeHandler = (e) => {
    setGameCode(e.target.value);
  };

  return(
    <>
    {
      error && <ErrorModal error={error} onClear={clearError} />
    }
    {
      isLoading && <LoadingSpinner asOverlay />
    }
      <div className="banner">
        <img src="images/banner.jpg" alt=""/>
      </div>
      {
        auth.token && (
          <>
          <div className="code-input">
            <input type="text" placeholder="ENTER ROOM CODE" onChange={onInputChangeHandler}/>
          </div>
          <div className="code-input__buttons">
            <button onClick={enterRoom}>ENTER ROOM</button>
            <button onClick={() => setIsCreateRoomShown(true)}>CREATE ROOM</button>
          </div>
          <Modal show={isCreateRoomShown} onCancel={closeCreateRoomHandler}>
            <CreateRoom />
      		</Modal>
          </>
        )
      }
      {
        !auth.token && (
          <div className="code-input__buttons">
            <a href="/auth">LOG IN</a>
          </div>
        )
      }
    </>
  );
};

export default Home;
