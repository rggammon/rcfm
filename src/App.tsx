import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';
import './App.css';
import { AppBar, IconButton, Typography, Toolbar } from '@material-ui/core';
import { Menu as MenuIcon } from '@material-ui/icons';
import { useAsyncEffect } from 'use-async-effect';
import { User } from '../server/src/resourceTypes/user';
import { Route, Switch } from "react-router-dom";
import Add from './pages/Add';
import Home from './pages/Home';
import Play from './pages/Play';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

function App() {
  const classes = useStyles();
  const [ user, setUser ] = useState<User | undefined>(undefined);

  useAsyncEffect(async () => {
    const response = await axios.get("/api/v1/me");
    if (response.status === 200) {
        setUser(response.data);
    }
  }, []);
  return (
    <div className="App">
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            Squac
          </Typography>
          {user ? 
            (<>{user.displayName}&nbsp;|&nbsp;<a href="/api/v1/signout">Sign out</a></>) : 
            <a href="/api/v1/signin">Sign in</a>
          }
        </Toolbar>
      </AppBar>
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        { user && 
          <Route exact path="/add">
            <Add />
          </Route> }
        <Route exact path="/play/:id">
          <Play />
        </Route>
      </Switch>
    </div>
  );
}

export default App;