import React, { useState } from 'react';
import { Grid } from 'semantic-ui-react';
import { useAsyncEffect } from 'use-async-effect';
import axios from 'axios';
import { Tweet } from 'react-twitter-widgets'
import { Squawk } from '../../server/src/resourceTypes/squawk';

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
        <Grid celled>
            {state.squawks.map(s =>
                <Grid.Row>
                    <Grid.Column width={16}>
                        <Tweet tweetId={s.tweetId} options={{ align: "center" }}></Tweet>
                    </Grid.Column>
                </Grid.Row>
            )}
        </Grid>
    );
}

export default Home;