import React from 'react';
import './App.css';
import { Menu } from 'semantic-ui-react'

function App() {
  return (
    <div className="App">
      <Menu attached='top'>
        <Menu.Menu position='right'>
          Login
        </Menu.Menu>
      </Menu>
    </div>
  );
}

export default App;
