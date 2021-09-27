import React from 'react';

import './user.css';

const User = () => {
  return(
    <div className="user">
      <div className="user_info">
        <h2>USER INFO</h2>
        <h4><span>Name:</span> Diego Gómez</h4>
        <h4><span>Email:</span> diegomezrd@gmail.com</h4>
        <h4><span>Playing since:</span> 2021 - 08 - 23</h4>
      </div>
      <div className="user_history">
        <h2>HISTORY</h2>
        <div className="user_history__item won">
          <img src="images/cards/2_of_diamonds.png" alt=""/>
          <img src="images/cards/2_of_diamonds.png" alt=""/>
          <img src="images/cards/2_of_diamonds.png" alt=""/>
          <img src="images/cards/2_of_diamonds.png" alt=""/>
          <img src="images/cards/2_of_diamonds.png" alt=""/>
          <h5>2021 - 08 - 23</h5>
        </div>
        <div className="user_history__item lost">
          <img src="images/cards/2_of_diamonds.png" alt=""/>
          <img src="images/cards/2_of_diamonds.png" alt=""/>
          <img src="images/cards/2_of_diamonds.png" alt=""/>
          <img src="images/cards/2_of_diamonds.png" alt=""/>
          <img src="images/cards/2_of_diamonds.png" alt=""/>
          <h5>2021 - 08 - 23</h5>
        </div>
        <div className="user_history__item lost">
          <img src="images/cards/2_of_diamonds.png" alt=""/>
          <img src="images/cards/2_of_diamonds.png" alt=""/>
          <img src="images/cards/2_of_diamonds.png" alt=""/>
          <img src="images/cards/2_of_diamonds.png" alt=""/>
          <img src="images/cards/2_of_diamonds.png" alt=""/>
          <h5>2021 - 08 - 23</h5>
        </div>
      </div>
    </div>
  )
};

export default User;
