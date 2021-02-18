import React, { useState } from 'react';
import { withAITracking } from '@microsoft/applicationinsights-react-js';
import { reactPlugin } from '../AppInsights';
import { useAsyncEffect } from 'use-async-effect';
import { User } from '../../server/src/resourceTypes/user';
import axios from 'axios';

function Settings() {
    const [ user, setUser ] = useState<User | undefined>(undefined);

    useAsyncEffect(async () => {
        const response = await axios.get("/api/v1/me");
        if (response.status === 200) {
            setUser(response.data);
        }
    }, []);
    return (<>
        {user ? 
            (<>{user.displayName}&nbsp;|&nbsp;<a href="/api/v1/signout">Sign out</a></>) : 
            <a href="/api/v1/signin">Sign in</a>
            }
    </>);
}

export default withAITracking(reactPlugin, Settings);