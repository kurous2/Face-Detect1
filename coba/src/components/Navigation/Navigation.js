import React from 'react';
import Navbar from 'react-bootstrap/Nav';


const Navigation = ({ onRouteChange, isSignedIn }) => {
  if (isSignedIn) {
    return (
      <Navbar style={{display: 'flex', justifyContent: 'flex-end'}}>
          <p 
            onClick={() => onRouteChange('signout')} 
            className='f3 link dim black underline pa3 pointer'>Sign Out
          </p>
      </Navbar>
    );
  } else {
      return (
        <nav style={{display: 'flex', justifyContent: 'flex-end'}}>
          <p 
            onClick={() => onRouteChange('signin')} 
            className='f3 link dim black underline pa3 pointer'>Sign In
          </p>
          <p 
            onClick={() => onRouteChange('register')} 
            className='f3 link dim black underline pa3 pointer'>Register
          </p>
        </nav>
      );
  }
}

export default Navigation;