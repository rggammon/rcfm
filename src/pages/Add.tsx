import React, { useContext, useState } from 'react';
import axios from 'axios';
import { useAsyncEffect } from 'use-async-effect';
import { Button, Grid, TextField } from '@material-ui/core'
import { AudiusClient, Playlist_search_result, IPlaylist, ITrack } from '../clients/audiusClient';
import { PlaylistList } from '../components/PlaylistList'
import { withAITracking } from '@microsoft/applicationinsights-react-js';
import { reactPlugin } from '../AppInsights';
import { Hashtag } from 'react-twitter-widgets';
import { UserContext } from '../contexts/userContext';
import { makeStyles } from '@material-ui/core/styles';

interface AddState {
    pendingSearch: string;
    search: string;
    searchResults: IPlaylist[];
    tracks: ITrack[];
}

const useStyles = makeStyles((theme) => ({
    container: {
        height: "100%",
        textAlign: "center"
    },
}));

function Add() {
    const classes = useStyles();
    const userContext = useContext(UserContext);
    const [ state, setState ] = useState<AddState>({
        pendingSearch: "",
        search: "",
        searchResults: [],
        tracks: []
    });

    useAsyncEffect(async () => {
        if (state.pendingSearch.length === 0) {
            setState({
                ...state,
                search: state.pendingSearch,
                searchResults: [],
            });
            return;
        }
        
        // https://api.audius.co
        const client = new AudiusClient("https://discoveryprovider.audius.co/v1");
        const searchResults: Playlist_search_result = await client.search_Playlists(state.pendingSearch, "false");
        if (searchResults.data && searchResults.data.length > 0) {
            setState((prevState) => ({
                ...prevState,
                search: prevState.pendingSearch,
                searchResults: searchResults.data!
            }));
        }
    }, [state.search]);


    if (!userContext.user) {
        return (
            <Grid container className={classes.container} alignItems="center" justify="center" alignContent="center">
                <Grid item xs={12}>
                    You need to log in.
                </Grid>
            </Grid>);
    }

    return (<>
        <Grid container className={classes.container} alignItems="center">
            <Grid item xs={12}>
                <h1>Pick an <a href="https://audius.co" target="_blank" rel="noopener noreferrer">Audius</a> playlist</h1>
                <TextField placeholder='Search...' onChange={onSearchChange}></TextField>
                <Button onClick={onSearchClick}>Search</Button>
                <PlaylistList playlists={state.searchResults} onSelected={onTracksSelected} />
            </Grid>
            <Grid item xs={12}>
                <Button onClick={handleSubmit}>Submit</Button>
            </Grid>
            <Grid item xs={12}>
                <h1>Now tweet the playlist</h1>
                <Hashtag hashtag="squac" options={{
                    text: "Check out this playlist I made!",
                    url: "https://squ.ac/0"
                }} />
            </Grid>
        </Grid>
    </>);

    function onSearchChange(evt: React.ChangeEvent<HTMLInputElement>) {
        setState({...state, pendingSearch: evt.target.value});
    }

    function onSearchClick() {
        setState((prevState) => ({
            ...prevState,
            search: prevState.pendingSearch
        }));
    }

    function onTracksSelected(tracks: ITrack[]) {
        setState((prevState) => ({
            ...prevState,
            tracks
        }));
    }

    async function handleSubmit(): Promise<void> {
        const value = state.tracks.map((track) => track.id).filter(id => !!id) ?? [];
        if (value.length === 0) {
            // error: no tracks
            return;
        }

        await axios.post("/api/v1/squawks", {
            value
        });
    }
}

export default withAITracking(reactPlugin, Add, "Add", "aitracking");