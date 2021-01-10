// https://github.com/Semantic-Org/Semantic-UI/pull/6260
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react';
import axios from 'axios';
import { useAsyncEffect } from 'use-async-effect';
import { Button, Grid, Input, List, InputOnChangeData } from 'semantic-ui-react'
import { SearchResult } from '../../server/src/resourceTypes/searchResults';
import { useHistory } from 'react-router-dom';
import { AudiusClient, Playlist_search_result } from '../clients/audiusClient';

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
        <List.Item>
            <a onClick={() => setState({ ...state, selectedId: searchResult.document.id })}>
                {searchResult.document.name}
            </a>
        </List.Item>
    ));

    return (<>
        <Grid celled>
            <Grid.Row>
                <Grid.Column width={16}>
                    <h1>Add a squawk</h1>
                    <h2>Choose an Audius playlist, 11 tracks or fewer</h2>
                    <Input loading icon='user' placeholder='Search...' onChange={onSearchChange}></Input>
                    <Button onClick={onSearchClick}>Search</Button>
                    <List>
                        {playlistList}
                    </List>

                    <h2>Write a tweet</h2>
                    <Input onChange={onTweetChange}></Input>

                    <h2>Post!</h2>
                    <Input onChange={onTagChange}></Input>
                    <Button onClick={handleSubmit}>Submit</Button>
                </Grid.Column>
            </Grid.Row>
        </Grid>
    </>);

    function onSearchChange(evt: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) {
        setState({...state, pendingSearch: evt.target.value});
    }

    function onTagChange(evt: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) {
        setState({...state, tag: evt.target.value});
    }

    function onTweetChange(evt: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) {
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

        await axios.put(`/api/v1/users/me/squawks/${state.tag}`, {
            data: { 
                ...response.data,
                tweet: state.tweet
            },
        });

        history.push("/");
    }
}

export default Add;