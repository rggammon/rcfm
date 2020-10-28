// https://github.com/Semantic-Org/Semantic-UI/pull/6260
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react';
import axios from 'axios';
import { useAsyncEffect } from 'use-async-effect';
import 'react-h5-audio-player/lib/styles.css';
import AudioPlayer from 'react-h5-audio-player';
import { SearchResult } from '../../server/src/resourceTypes/searchResults';
import { Grid, List } from 'semantic-ui-react'

interface PlayerState {
    searchResults: SearchResult[];
    selectedSrc?: string;
}

function Player() {
    const [ state, setState ] = useState<PlayerState>({
        searchResults: []
    });

    useAsyncEffect(async () => {  
        const response = await axios.get("/api/v1/search");
        setState({ searchResults: response.data });
    }, []);
  
    const trackList = state.searchResults.map((searchResult) => (
        <List.Item>
            <a onClick={() => setState({ ...state, selectedSrc: searchResult.document.src })}>
                {searchResult.document.title}
            </a>
        </List.Item>
    ));

    return (<>
        <h1>Player</h1>
        <Grid celled>
            <Grid.Row>
                <Grid.Column width={3}>
                    <List>
                        {trackList}
                    </List>
                </Grid.Column>
                <Grid.Column width={13}>
                <AudioPlayer src={state.selectedSrc} />
                </Grid.Column>
            </Grid.Row>
        </Grid>
    </>);
}

export default Player;