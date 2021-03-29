import React from 'react';
import { Grid } from '@material-ui/core';
import { withAITracking } from '@microsoft/applicationinsights-react-js';
import { reactPlugin } from '../AppInsights';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    container: {
        height: "100%"
    },
}));

function Search() {
    const classes = useStyles();
    return (
        <Grid container className={classes.container} alignItems="center">
        </Grid>
    );
}

export default withAITracking(reactPlugin, Search, "Search", "aitracking");