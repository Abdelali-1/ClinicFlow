import {createContext, useContext, useEffect, useState} from 'react';
import api from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({children}){
    const  [user, setUser] = useState(null);
    const  [loading, setLoading] = useState(true);

    useEffect(() => {
        if(!localStorage.getItem('token')) {
            setLoading(false);
            return;
        }
        api.get('/auth/me')
            .then((r) => setUser(r.data.user))
            .catch(() => localStorage.removeItem('token'))
            .finally(() => setLoading(false));
    },[]);

    const login = async (email, password) => {
        const {data} = await api.post('/auth/login', {email, password});
        localStorage.setItem('token', data.token);
        setUser(data.user);
    }
    const logOut = () => {
        localStorage.removeItem('token');
        setUser(null);
    }
    return <AuthContext.Provider value={{user, loading, login, logOut}}>{children}</AuthContext.Provider>
}
export const useAuth = () => useContext(AuthContext);