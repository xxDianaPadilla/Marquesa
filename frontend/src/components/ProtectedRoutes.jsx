import React from "react";
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredUserType = null }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-container" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <div>Cargando...</div>
            </div>
        );
    }

    if(!isAuthenticated){
        return <Navigate to="/login" replace />;
    }

    if(requiredUserType && user.userType !== requiredUserType){
        if(user.userType === 'admin'){
            return <Navigate to="/dashboard" replace />;
        }else{
            return <Navigate to="/home" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;