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

  useEffect(() => {
    const fetchUser = async () => {
        const responseData = await sendRequest(`${process.env.REACT_APP_BACKEND_URL}/api/users/${auth.userId}`);
        console.log(responseData);
        setExistingUser(responseData.user);
    };
    fetchUser();
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
      existingUser && <User user={existingUser}/>
    }
    </>
  )
}

export default UserContainer;
