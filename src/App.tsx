import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { AppBar, BottomNavigation, BottomNavigationAction, Box, Typography, Toolbar } from '@material-ui/core';
import { Add as AddIcon, Search as SearchIcon, Settings as SettingsIcon, PlayCircleOutline as PlayIcon } from '@material-ui/icons';
import { Redirect, Route, Switch, useHistory, useLocation } from "react-router-dom";
import Play from './pages/Play';
import Add from './pages/Add';
import Search from './pages/Search';
import Settings from './pages/Settings';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

const useStyles = makeStyles((theme) => ({
  bottomNav: {
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
    textAlign: "center",
  },
}));

function App() {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const [ audioPlayerSrc, setAudioPlayerSrc ] = useState<string | undefined>(undefined);
  
  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Box>
        <AppBar position="relative">
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
              Squac
            </Typography>
          </Toolbar>
        </AppBar>
      </Box>
      <Box flexGrow="1" overflow="auto">
        <Switch>
          <Route exact path="/">
            <Redirect to="/play" />
          </Route>
          <Route path="/play/:id?" render={(props) => <Play {...props} setAudioPlayerSrc={setAudioPlayerSrc} />} />
          <Route exact path="/search" component={Search} />
          <Route exact path="/add" component={Add} />
          <Route exact path="/settings" component={Settings} />
        </Switch>
        </Box>
      <Box>
        <AudioPlayer src={audioPlayerSrc} autoPlay={false} autoPlayAfterSrcChange={false} />
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
          <BottomNavigationAction label="Add" value="add" icon={<AddIcon />} className={classes.bottomNavIcon} />
          <BottomNavigationAction label="Settings" value="settings" icon={<SettingsIcon />} className={classes.bottomNavIcon} />
        </BottomNavigation>
      </Box>
    </Box>
  );
}

export default App;