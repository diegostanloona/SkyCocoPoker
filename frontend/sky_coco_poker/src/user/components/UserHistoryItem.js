import React from 'react';

const UserHistoryItem = props => {
  console.log(props);

  return(
    <div className={`user_history__item ${props.item.didWin? 'won': 'lost'}`}>
      {props.item.cards.map(card =>
        <img src={`/images/cards/${card.value}_of_${card.suit}.png`} alt=""/>
      )}
    </div>
  );
};

export default UserHistoryItem;
