import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import { AudiusClient, IPlaylist, ITrack } from '../clients/audiusClient';
import { Collapse, List, ListItem, ListItemText } from '@material-ui/core'
import { useAsyncEffect } from 'use-async-effect';

export interface PlaylistAndTracks {
    playlist: IPlaylist;
    tracks: ITrack[];
}

export interface PlaylistListProps {
    playlists: IPlaylist[];
    onSelected: (tracks: ITrack[]) => void;
}

interface PlaylistListState {
    expanded: { [key: string]: boolean };
    tracks: { [key: string]: ITrack[] };
    selectedPlaylist?: IPlaylist;
}

const useStyles = makeStyles((theme) => ({
    nested: {
      paddingLeft: theme.spacing(4),
    }
}));

export function PlaylistList(props: PlaylistListProps) {
    const classes = useStyles();
    const [ state, setState ] = useState<PlaylistListState>({ expanded: {}, tracks: {} });
    useAsyncEffect(async () => {
        const client = new AudiusClient("https://discoveryprovider.audius.co/v1");
        let tracks = Object.assign({}, state.tracks);
        await Promise.all(
            Object.keys(state.expanded).map((playlistId) => {
                if (state.expanded[playlistId] && !state.tracks[playlistId]) {
                    return client.get_Playlist_Tracks(playlistId)
                        .then((response) => { 
                            tracks[playlistId] = response.data!;
                        });
                }
                return undefined;
            }));

        setState((prevState) => ({
            ...prevState,
            tracks
        }));

        if (state.selectedPlaylist) {
            props.onSelected(tracks[state.selectedPlaylist.id])
        }

    }, [state.expanded]);

    return (
        <List>
            {props.playlists.map((playlist) => renderPlaylist(playlist))}
        </List>
    );

    function renderPlaylist(playlist: IPlaylist) {
        return (
            <>
                <ListItem button onClick={() => handleClick(playlist)}>
                    <ListItemText primary={playlist.playlist_name} />
                    {state.expanded[playlist.id] ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={state.expanded[playlist.id]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        {state.tracks[playlist.id]?.map((track) => renderTrack(track))}
                    </List>
                </Collapse>
            </>
        );
    }

    function renderTrack(track: ITrack) {
        return (
            <ListItem button className={classes.nested}>
                <ListItemText primary={track.title} />
            </ListItem>
        );
    }

    function handleClick(playlist: IPlaylist) {
        const expanded = Object.assign({}, state.expanded);
        expanded[playlist.id] = !expanded[playlist.id];
        setState((prevState) => ({
            ...prevState,
            expanded,
            selectedPlaylist: playlist
        }));
    }
}
