import React, { useState } from 'react';

const CommunityCard = props => {

  const [isCardSelected, setIsCardSelected] = useState();

  const toggleSelectHandler = () => {
    if(isCardSelected){
      props.unselectCardHandler(props.card, setIsCardSelected);
    }else{
      props.selectCardHandler(props.card, setIsCardSelected);
    }
  }

  return(
    <img className={isCardSelected ? 'card_selected' : ''} onClick={toggleSelectHandler} src={`images/cards/${props.card.value}_of_${props.card.suit}.png`} alt=""/>
  );
};

export default CommunityCard;
