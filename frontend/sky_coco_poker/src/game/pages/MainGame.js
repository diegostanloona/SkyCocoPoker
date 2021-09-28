import React, {useState} from 'react';

import Modal from '../../shared/components/UIElements/Modal';

import './MainGame.css';

const MainGame = () => {

  const [areCardsShown, setAreCardsShown] = useState(false);

  const closeCardsHandler = () => {
    setAreCardsShown(false);
  }


  return (
    <div className="game">
      <h2 className="turn">Flop {/*Turn, River*/}</h2>
      <div className="community_cards">
        <span>COMMUNITY CARDS</span>
        <img src="images/cards/2_of_diamonds.png" alt=""/>
        <img src="images/cards/2_of_hearts.png" alt=""/>
        <img src="images/cards/8_of_diamonds.png" alt=""/>
        <img src="images/cards/2_of_diamonds.png" alt=""/>
        <img src="images/cards/2_of_spades.png" alt=""/>
      </div>
      <div className="bet-input">
        <input type="number" placeholder="Type your bet"/>
        <button>Bet</button>{/*apostar*/}
        <button className="danger">Fold</button>
      </div>
      <div className="players_list">
        <div className="player_item">
          <h4>Diego Gómez</h4>
          <h5>Bet: 500</h5>
          <h6 className="waiting">Waiting...</h6>

        </div>
        <div className="player_item">
          <h4>Diego Gómez</h4>
          <h5>Bet: 500</h5>
          <h6 className="fold">Fold</h6>

        </div>
        <div className="player_item">
          <h4>Diego Gómez</h4>
          <h5>Bet: 500</h5>
          <h6 className="ready">Ready</h6>
        </div>
        <div className="player_item">
          <h4>Diego Gómez</h4>
          <h5>Bet: 500</h5>
          <h6 className="ready">Ready</h6>
        </div>
      </div>
      <Modal show={areCardsShown} onCancel={closeCardsHandler}>
        <div className="cards">
          <img src="images/cards/2_of_diamonds.png" alt=""/>
          <img src="images/cards/2_of_diamonds.png" alt=""/>
        </div>
  		</Modal>
      <div className="bottom-bar" onClick={() => setAreCardsShown(true)}>
        <h4>Show cards</h4>
      </div>
    </div>
  );
};

export default MainGame;
