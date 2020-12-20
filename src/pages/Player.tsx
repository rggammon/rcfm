// https://github.com/Semantic-Org/Semantic-UI/pull/6260
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react';
import axios from 'axios';
import { AudiusClient, Track_search } from '../clients/audiusClient';
import { useAsyncEffect } from 'use-async-effect';
import 'react-h5-audio-player/lib/styles.css';
import AudioPlayer from 'react-h5-audio-player';
import { SearchResult } from '../../server/src/resourceTypes/searchResults';
import { Button, Grid, Input, List, InputOnChangeData } from 'semantic-ui-react'

interface PlayerState {
    pendingSearch: string;
    search: string;
    searchResults: SearchResult[];
    selectedSrc?: string;
}

function Player() {
    const [ state, setState ] = useState<PlayerState>({
        pendingSearch: "",
        search: "",
        searchResults: []
    });

    useAsyncEffect(async () => {
        if (state.pendingSearch.length === 0) {
            setState({
                ...state,
                search: state.pendingSearch,
                searchResults: []
            });
            return;
        }
        
        // https://api.audius.co
        const client = new AudiusClient("https://discoveryprovider.audius.co/v1");
        const searchResults: Track_search = await client.search_Tracks(state.pendingSearch, "false");
        if (searchResults.data && searchResults.data.length > 0) {
            const track = searchResults.data[0];
            setState({
                ...state,
                search: state.pendingSearch,
                searchResults: [
                    {
                        score: 1.0,
                        document: {
                            src: `https://discoveryprovider.audius.co/v1/tracks/${track.id}/stream`,
                            title: track.title
                        }
                    }
                ]
            });
            return;
        }

        const response = await axios.get("/api/v1/search");
        setState({
            ...state,
            searchResults: response.data 
        });
    }, [state.search]);
  
    const trackList = state.searchResults.map((searchResult) => (
        <List.Item>
            <a onClick={() => setState({ ...state, selectedSrc: searchResult.document.src })}>
                {searchResult.document.title}
            </a>
        </List.Item>
    ));

    return (<>
        <h1>Player</h1>
        <Input onChange={onSearchChange}></Input>
        <Button onClick={onSearchClick}>Search</Button>
        <Grid celled>
            <Grid.Row>
                <Grid.Column width={3}>
                    <List>
                        {trackList}
                    </List>
                </Grid.Column>
                <Grid.Column width={13}>
                    {state.selectedSrc ? <AudioPlayer src={state.selectedSrc} /> : null}
                </Grid.Column>
            </Grid.Row>
        </Grid>
    </>);

    function onSearchChange(evt: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) {
        setState({...state, pendingSearch: evt.target.value});
    }

    function onSearchClick() {
        setState({
            ...state,
            search: state.pendingSearch
        });
    }
}

export default Player;