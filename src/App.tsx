import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import { Menu } from 'semantic-ui-react';
import { useAsyncEffect } from 'use-async-effect';
import { User } from '../server/src/resourceTypes/user';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

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
      { user && 
        <AudioPlayer
          src="https://files.freemusicarchive.org/storage-freemusicarchive-org/music/Creative_Commons/Paper_Navy/All_Grown_Up/Paper_Navy_-_08_-_Swan_Song.mp3?download=1"
        />
      }
      <p>
        <a href="https://freemusicarchive.org/music/Paper_Navy/All_Grown_Up/08_Swan_Song">Swan song by Paper Navy from Free Music Archive</a>
      </p>
      <p>
        <a href="https://creativecommons.org/licenses/by-nc-sa/3.0/us/">Attribution-NonCommercial-ShareAlike 3.0 United States (CC BY-NC-SA 3.0 US)</a>
      </p>
    </div>
  );
}

export default App;
