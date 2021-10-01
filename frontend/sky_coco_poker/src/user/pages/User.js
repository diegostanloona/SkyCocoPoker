import React from 'react';

import UserHistoryItem from '../components/UserHistoryItem';

import './user.css';

const User = props => {
  return(
    /*
    props.name
    props.email
    props.signupDate
    */
    <div className="user">
      <div className="user_info">
        <h2>USER INFO</h2>
        <h4><span>Name:</span> {props.user.name}</h4>
        <h4><span>Email:</span> {props.user.email}</h4>
        <h4><span>Playing since:</span> {props.user.signupDate}</h4>
      </div>
      <div className="user_history">
        <h2>HISTORY</h2>
        <UserHistoryItem/>
        <UserHistoryItem/>
        <UserHistoryItem/>
        <UserHistoryItem/>
      </div>
    </div>
  )
};

export default User;
