import React, { useState } from 'react';
import { UserContext } from './userContext'
import { User } from '../../server/src/resourceTypes/user';
import { useAsyncEffect } from 'use-async-effect';
import axios from 'axios';

export const UserProvider = ({children}: { children: React.ReactNode}) => {
    const [data, setData] = useState<{ loading: boolean; user?: User }>({ 
        loading: true
    });
  
    useAsyncEffect(async () => {
        try {
            const response = await axios.get("/api/v1/me");
            if (response.status === 200) {
                setData({
                    loading: false,
                    user: response.data
                });
                return;
            }
        } catch {
            // http error
        }

        setData({
            loading: false,
            user: undefined
        });
    },[])
   
   const { Provider } = UserContext
   return(
       <Provider value={data}>
           {children}
       </Provider>
   )
}