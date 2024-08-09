//@ts-nocheck
import React, { useState, useEffect, createContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

interface LoginType {
    email: string, 
    password: string
}

interface AuthProviderProps {
    children: ReactNode;
}

interface AuthContextType {
    authenticated: boolean;
    user: string | null;
    loading: boolean;
    logout: () => void;
}

export const AuthContext = createContext();

export const AuthProvider = ({ children }: AuthProviderProps) => {

    const navigate = useNavigate();
    const [ user, setUser ] = useState('');
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState(null);

    useEffect(() => {
        const userStorage = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (userStorage && token) {
            setUser(JSON.parse(userStorage));
            api.defaults.headers.Authorization = `Bearer ${JSON.parse(token)}`;
        }

        setLoading(false);
    }, []);

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');

        api.defaults.headers.Authorization = null;

        setUser('');
        navigate('/login')
    }
    return (
        <AuthContext.Provider 
        value={{
            authenticated: Boolean(user), 
            user: user, 
            loading, 
            logout
            //erro,
            //setErro
            }}>
            {children}
        </AuthContext.Provider>
    )
}