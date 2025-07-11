import React from "react";
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Componente ProtectedRoute que protege rutas basándose en autenticación y tipo de usuario
// Recibe 'children' (componentes hijos) y 'requiredUserType' (tipo de usuario requerido, opcional)
const ProtectedRoutes = ({ children, requiredUserType = null }) => {
    // Obtiene el estado de autenticación, información del usuario y estado de carga del contexto
    const { isAuthenticated, user, loading } = useAuth();

    // Si está cargando, muestra un indicador de carga
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

    // Si el usuario no está autenticado, redirige a la página de login
    if(!isAuthenticated){
        return <Navigate to="/login" replace />;
    }

    // Si se requiere un tipo de usuario específico y el usuario actual no coincide
    if(requiredUserType && user.userType !== requiredUserType){
        // Si el usuario es admin, redirige al dashboard
        if(user.userType === 'admin'){
            return <Navigate to="/dashboard" replace />;
        }else{
            // Si es otro tipo de usuario, redirige al home
            return <Navigate to="/home" replace />;
        }
    }

    // Si todas las validaciones pasan, renderiza los componentes hijos
    return children;
};

// Exporta el componente como default
export default ProtectedRoutes;