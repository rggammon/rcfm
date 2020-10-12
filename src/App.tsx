import React from 'react';
import './App.css';
import { Menu } from 'semantic-ui-react';
import { useAsyncEffect } from 'use-async-effect';

function App() {
  useAsyncEffect(async () => {
    await fetch("/api/hello");
  }, []);
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
