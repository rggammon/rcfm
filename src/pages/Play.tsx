import React, { useState } from 'react';
import 'react-h5-audio-player/lib/styles.css';
import AudioPlayer from 'react-h5-audio-player';
import { Grid } from 'semantic-ui-react'
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAsyncEffect } from 'use-async-effect';
import { withAITracking } from '@microsoft/applicationinsights-react-js';
import { reactPlugin } from '../AppInsights';

interface PlayState {
    src?: string;
}

function Play() {
    const { id } = useParams<{id: string}>();
    const [ state, setState ] = useState<PlayState>({
        src: undefined
    });

    useAsyncEffect(async () => {
        const squawkResponse = await axios.get(`/api/v1/users/me/squawks/${id}`);
        const trackId = squawkResponse.data.data[0].id;
        setState({
            src: `https://discoveryprovider.audius.co/v1/tracks/${trackId}/stream`
        });
    }, []);

    return (<>
        <h1>Player</h1>
        <Grid celled>
            <Grid.Row>
                <Grid.Column width={16}>
                    <AudioPlayer src={state.src} />
                </Grid.Column>
            </Grid.Row>
        </Grid>
    </>);
}

export default withAITracking(reactPlugin, Play);