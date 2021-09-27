import React from 'react';

import './Home.css';

const Home = () => {
  return(
    <>
      <div className="banner">
        <img src="images/banner.jpg" alt=""/>
      </div>
      <div className="code-input">
        <input type="text" placeholder="Enter room code"/>
      </div>
      <div className="code-input__buttons">
        {
          true &&
            <>
              <button>LOG IN</button>
              <button>CONTINUE AS A GUEST</button>
            </>
        }
        {false &&
          <button className="loggedin">CONTINUE</button>
        }
      </div>
    </>
  );
};

export default Home;
