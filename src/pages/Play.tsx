import React, { useState } from 'react';
import { Grid } from '@material-ui/core';
import { Tweet } from 'react-twitter-widgets'
import { Squawk } from '../../server/src/resourceTypes/squawk';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAsyncEffect } from 'use-async-effect';
import { withAITracking } from '@microsoft/applicationinsights-react-js';
import { reactPlugin } from '../AppInsights';

interface PlayProps {
    setAudioPlayerSrc: (src: string) => void;
}

interface PlayState {
    squawk?: Squawk;
}

function Play(props: PlayProps) {
    const { id } = useParams<{id: string}>();
    const [ state, setState ] = useState<PlayState>({
        squawk: undefined
    });

    useAsyncEffect(async () => {
        let squawk: Squawk;
        if (id) {
            const squawkResponse = await axios.get(`/api/v1/users/me/squawks/${id}`);
            squawk = squawkResponse.data.value;
        } else {
            const squawkResponse = await axios.get("/api/v1/users/me/squawks");
            squawk = squawkResponse.data.value[0];
        }

        setState({
            ...state,
            squawk
        });    
        const trackId = squawk.tracks[0];
        props.setAudioPlayerSrc(`https://discoveryprovider.audius.co/v1/tracks/${trackId}/stream`);
    }, []);


    return (<>
        <Grid container>
        {state.squawk?.tweetId && (
            <Grid item xs={12}>
                <Tweet tweetId={state.squawk.tweetId} options={{ align: "center" }}></Tweet>
            </Grid>
        )}
        </Grid>
    </>);
}

export default withAITracking(reactPlugin, Play);