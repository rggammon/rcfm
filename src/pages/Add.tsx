import React, { useState } from 'react';
import axios from 'axios';
import { useAsyncEffect } from 'use-async-effect';
import { Button, Grid, TextField, List, ListItem, ListItemText } from '@material-ui/core'
import { SearchResult } from '../../server/src/resourceTypes/searchResults';
import { useHistory } from 'react-router-dom';
import { AudiusClient, Playlist_search_result } from '../clients/audiusClient';
import { withAITracking } from '@microsoft/applicationinsights-react-js';
import { reactPlugin } from '../AppInsights';

interface AddState {
    pendingSearch: string;
    search: string;
    searchResults: SearchResult[];
    selectedId?: string;
    tag: string;
    tweet: string;
}

function Add() {
    const history = useHistory();
    const [ state, setState ] = useState<AddState>({
        pendingSearch: "",
        search: "",
        searchResults: [],
        tag: "0",
        tweet: ""
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
        const searchResults: Playlist_search_result = await client.search_Playlists(state.pendingSearch, "false");
        if (searchResults.data && searchResults.data.length > 0) {
            const playlist = searchResults.data.map(p => (
                {
                    score: 1.0,
                    document: {
                        id: p.id,
                        name: p.playlist_name
                    }
                }
            ));
            setState({
                ...state,
                search: state.pendingSearch,
                searchResults: playlist
            });
        }
    }, [state.search]);
  
    const playlistList = state.searchResults.map((searchResult) => (
        <ListItem button onClick={() => setState({ ...state, selectedId: searchResult.document.id })}>            
            <ListItemText>
                {searchResult.document.name}
            </ListItemText>
        </ListItem>
    ));

    return (<>
        <Grid container>
            <Grid item xs={12}>
                <h1>Add a squawk</h1>
                <h2>Choose an Audius playlist, 13 tracks or fewer</h2>
                <TextField placeholder='Search...' onChange={onSearchChange}></TextField>
                <Button onClick={onSearchClick}>Search</Button>
                <List>
                    {playlistList}
                </List>

                <h2>Write a tweet</h2>
                <TextField onChange={onTweetChange}></TextField>

                <h2>Post!</h2>
                <Button onClick={handleSubmit}>Submit</Button>
            </Grid>
        </Grid>
    </>);

    function onSearchChange(evt: React.ChangeEvent<HTMLInputElement>) {
        setState({...state, pendingSearch: evt.target.value});
    }

    function onTweetChange(evt: React.ChangeEvent<HTMLInputElement>) {
        setState({...state, tweet: evt.target.value});
    }

    function onSearchClick() {
        setState({
            ...state,
            search: state.pendingSearch
        });
    }

    async function handleSubmit(): Promise<void> {
        const client = new AudiusClient("https://discoveryprovider.audius.co/v1");
        const response = await client.get_Playlist_Tracks(state.selectedId!)
        const value = response?.data?.map((track) => track.id).filter(id => !!id) ?? [];
        if (value.length === 0) {
            // error: no tracks
            return;
        }

        await axios.post("/api/v1/users/me/squawks", {
            value
        });

        history.push("/");
    }
}

export default withAITracking(reactPlugin, Add);