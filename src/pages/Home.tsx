import React, { useState } from 'react';
import { Grid } from '@material-ui/core';
import { useAsyncEffect } from 'use-async-effect';
import axios from 'axios';
import { Tweet } from 'react-twitter-widgets'
import { Squawk } from '../../server/src/resourceTypes/squawk';
import { withAITracking } from '@microsoft/applicationinsights-react-js';
import { reactPlugin } from '../AppInsights';

interface HomeState {
    squawks: Squawk[];
}

function Home() {
    const [ state, setState ] = useState<HomeState>({
        squawks: []
    });

    useAsyncEffect(async () => {
        const squawkResponse = await axios.get("/api/v1/users/me/squawks");
        setState({
            ...state,
            squawks: squawkResponse.data.value
        });
    }, []);

    return (
        <Grid container>
            {state.squawks.map(s =>
                <Grid item xs={12}>
                    <Tweet tweetId={s.tweetId} options={{ align: "center" }}></Tweet>
                </Grid>
            )}
        </Grid>
    );
}

export default withAITracking(reactPlugin, Home);