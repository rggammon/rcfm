import React from 'react';
import { User } from '../../server/src/resourceTypes/user';

interface UserContextValue {
    loading: boolean;
    user?: User;
}

export const UserContext = React.createContext<UserContextValue>({
    loading: true,
    user: undefined
});