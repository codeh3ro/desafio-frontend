//@ts-nocheck
import { ReactNode, useContext } from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate
  } from "react-router-dom";

import { AuthProvider, AuthContext } from './contexts/auth';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';

interface PrivateRouteProviderProps {
    children: ReactNode;
}

export function AppRoutes() {

    const Private = ({children}: PrivateRouteProviderProps) => {
        const { authenticated, loading } = useContext(AuthContext);

        if(loading){
            return <div className='loading'>Carregando...</div>
        }

        if(!authenticated) {
            return <Navigate to="/login" />;
        }

        return children;
    }
    return (
        <>
        <Router>
            <AuthProvider>
                    <Routes>
                        <Route path="/" element={<Private><Dashboard /></Private>} />
                        <Route path="/login" element={<Login />} />
                    </Routes>
            </AuthProvider> 
        </Router>

        </>
    )
}