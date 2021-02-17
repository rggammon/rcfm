import React from 'react';
import { Grid } from '@material-ui/core';
import { withAITracking } from '@microsoft/applicationinsights-react-js';
import { reactPlugin } from '../AppInsights';

function Search() {
    return (
        <Grid container>
        </Grid>
    );
}

export default withAITracking(reactPlugin, Search);