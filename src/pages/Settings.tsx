import React, { useContext } from 'react';
import { withAITracking } from '@microsoft/applicationinsights-react-js';
import { reactPlugin } from '../AppInsights';
import { UserContext } from '../contexts/userContext';
import { makeStyles } from '@material-ui/core/styles';
import { ExitToApp as ExitIcon } from '@material-ui/icons';
import { CircularProgress, Grid } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    container: {
        height: "100%",
        textAlign: "center"
    },
}));
  

function Settings() {
    const classes = useStyles();
    const userContext = useContext(UserContext);

    return (
        <Grid container className={classes.container} alignItems="center">
            <Grid item xs={12}>
                {renderSettings()}
            </Grid>
        </Grid>);

    function renderSettings() {
        if (userContext.loading) {
            return <CircularProgress />;
        } else if (userContext.user) {
            return (
                <>
                    <p>
                        {userContext.user.photo && <img src={userContext.user.photo} alt="user" /> }
                        {userContext.user.displayName} ({userContext.user.username})
                    </p>
                    <ExitIcon/ ><a href="/api/v1/signout">Sign out</a>
                </>);
        } else {
            return <a href="/api/v1/signin">Sign in</a>;
        }
    }
}

export default withAITracking(reactPlugin, Settings, "Settings", "aitracking");