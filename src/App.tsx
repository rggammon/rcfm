import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import './App.css';
import { AppBar, BottomNavigation, BottomNavigationAction, Typography, Toolbar } from '@material-ui/core';
import { Add as AddIcon, Search as SearchIcon, Settings as SettingsIcon, PlayCircleOutline as PlayIcon } from '@material-ui/icons';
import { Redirect, Route, Switch, useHistory, useLocation } from "react-router-dom";
import Play from './pages/Play';
import Add from './pages/Add';
import Search from './pages/Search';
import Settings from './pages/Settings';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

const useStyles = makeStyles((theme) => ({
  footer: {
    position: 'fixed',
    bottom: 0,
    width: "100%"
  },
  bottomNav: {
    flexGrow: 1,
    backgroundColor: theme.palette.primary.main,
  },
  bottomNavIcon: {
    color: "lightgray",
    '&.Mui-selected': {
      color: theme.palette.primary.contrastText
    }
  },
  title: {
    flexGrow: 1,
  },
}));

function App() {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const [ audioPlayerSrc, setAudioPlayerSrc ] = useState<string | undefined>(undefined);
  
  return (
    <div className="App">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            Squac
          </Typography>
        </Toolbar>
      </AppBar>
      <Switch>
        <Route exact path="/">
          <Redirect to="/play" />
        </Route>
        <Route path="/play/:id?">
          <Play setAudioPlayerSrc={setAudioPlayerSrc} />
        </Route>
        <Route exact path="/search">
          <Search />
        </Route>
        <Route exact path="/add">
          <Add />
        </Route>
        <Route exact path="/settings">
          <Settings />
        </Route>
      </Switch>
      <div className={classes.footer}>
        <AudioPlayer src={audioPlayerSrc} />
        <BottomNavigation
          value={
            (() => {
                const parts = location.pathname.split("/");
                return parts?.length > 1 ? parts[1]: undefined;
            })()
          }
          onChange={(event, newValue) => {
            history.push("/" + newValue);
          }}
          showLabels
          className={classes.bottomNav}
        >
          <BottomNavigationAction label="Play" value="play" icon={<PlayIcon />} className={classes.bottomNavIcon} />
          <BottomNavigationAction label="Search" value="search" icon={<SearchIcon />} className={classes.bottomNavIcon} />
          <BottomNavigationAction label="Add" value="add" icon={<AddIcon  />} className={classes.bottomNavIcon} />
          <BottomNavigationAction label="Settings" value="settings" icon={<SettingsIcon />} className={classes.bottomNavIcon} />
        </BottomNavigation>
      </div>
    </div>
  );
}

export default App;