import React from 'react';

const UserHistoryItem = props => {
  return(
    /*
    props.didwin
    props.cards["2_of_diamonds"]
    props.date
    */
    <div className="user_history__item won">
      <img src="images/cards/2_of_diamonds.png" alt=""/>
      <img src="images/cards/2_of_diamonds.png" alt=""/>
      <img src="images/cards/2_of_diamonds.png" alt=""/>
      <img src="images/cards/2_of_diamonds.png" alt=""/>
      <img src="images/cards/2_of_diamonds.png" alt=""/>
      <h5>2021 - 08 - 23</h5>
    </div>
  );
};

export default UserHistoryItem;
