import React, { useState, useEffect, useContext } from 'react';

import User from '../pages/User';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';

const UserContainer = () => {

  const auth = useContext(AuthContext);

  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const [existingUser, setExistingUser] = useState();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
        const responseData = await sendRequest(`${process.env.REACT_APP_BACKEND_URL}/api/users/${auth.userId}`);
        setExistingUser(responseData.user);
    };

    const fetchHistory = async () => {
      const responseData = await sendRequest(`${process.env.REACT_APP_BACKEND_URL}/api/users/history/${auth.userId}`);
      console.log(responseData);
      setHistory(responseData.history);
    }
    fetchUser();
    fetchHistory();
  }, []);

  return(
    <>
    {
      error && <ErrorModal error={error} onClear={clearError} />
    }
    {
      !existingUser && isLoading && <LoadingSpinner asOverlay />
    }
    {
      existingUser && <User user={existingUser} history={history}/>
    }
    </>
  )
}

export default UserContainer;
