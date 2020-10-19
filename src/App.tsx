import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import { Menu } from 'semantic-ui-react';
import { useAsyncEffect } from 'use-async-effect';
import { User } from '../server/src/resourceTypes/user';

function App() {
  const [ user, setUser ] = useState<User | undefined>(undefined);

  useAsyncEffect(async () => {
    const response = await axios.get("/api/v1/me");
    if (response.status === 200) {
        setUser(response.data);
    }
  }, []);
  return (
    <div className="App">
      <Menu attached='top'>
        <Menu.Menu position='right'>
          {user ? 
            (<>{user.displayName}&nbsp;|&nbsp;<a href="/api/v1/signout">Sign out</a></>) : 
            <a href="/api/v1/signin">Sign in</a>
          }
        </Menu.Menu>
      </Menu>
    </div>
  );
}

export default App;
