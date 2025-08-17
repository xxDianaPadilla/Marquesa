import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-hot-toast';
 
/**
 * Hook personalizado para manejar autenticación con Google
 * ✅ EDITADO: Ahora maneja tokens independientes específicos para registro y login
 */
const useGoogleAuth = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { setAuthToken, checkAuthStatus, getUserInfo } = useAuth();
    const navigate = useNavigate();
 
    /**
     * ✅ ACTUALIZADO: Iniciar el proceso de autenticación con Google
     * Mantiene la redirección directa pero mejorada
     */
    const startGoogleAuth = useCallback(() => {
        if (isLoading) return;
       
        setIsLoading(true);
       
        try {
            console.log('🚀 === INICIANDO GOOGLE AUTH ===');
            console.log('🌍 Entorno:', process.env.NODE_ENV);
           
            // Redirigir directamente sin popup para evitar problemas COOP
            const googleAuthUrl = `https://marquesa.onrender.com/api/auth/google`;
           
            console.log('🔗 Redirigiendo a:', googleAuthUrl);
           
            // Redirigir en la misma ventana
            window.location.href = googleAuthUrl;
 
        } catch (error) {
            console.error('❌ Error iniciando autenticación con Google:', error);
            setIsLoading(false);
            toast.error('Error al conectar con Google');
        }
    }, [isLoading]);
 
    /**
     * ✅ NUEVO: Función para generar authToken desde tokenParaMantenerseLogueado (REGISTRO)
     * Esta función se llama después del registro completo
     */
    const generateAuthFromRegistroToken = useCallback(async () => {
        try {
            setIsLoading(true);
           
            console.log('🔄 === GENERANDO AUTH DESDE TOKEN DE REGISTRO ===');
            console.log('🍪 Cookies disponibles:', document.cookie);
           
            // Verificar si hay tokenParaMantenerseLogueado
            const hasRegistroToken = document.cookie.includes('tokenParaMantenerseLogueado=');
            console.log('🍪 tokenParaMantenerseLogueado presente:', hasRegistroToken);
           
            if (!hasRegistroToken) {
                console.log('⚠️ No se encontró tokenParaMantenerseLogueado');
                await new Promise(resolve => setTimeout(resolve, 2000));
               
                const hasTokenAfterWait = document.cookie.includes('tokenParaMantenerseLogueado=');
                if (!hasTokenAfterWait) {
                    return {
                        success: false,
                        message: 'No se encontró token de registro. Inténtalo nuevamente.'
                    };
                }
            }
           
            // Hacer petición para generar authToken desde token de registro
            const response = await fetch('https://marquesa.onrender.com/api/auth/google/generate-auth-from-registro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
 
            console.log('📡 Status de respuesta generateAuthFromRegistro:', response.status);
 
            const data = await response.json();
            console.log('📦 Respuesta del servidor generateAuthFromRegistro:', {
                success: data.success,
                hasToken: !!data.token,
                message: data.message
            });
           
            if (data.success) {
                console.log('✅ AuthToken generado exitosamente desde token de registro');
               
                // Manejar token igual que login tradicional
                if (data.token) {
                    console.log('💾 Guardando token generado...');
                   
                    if (setAuthToken && typeof setAuthToken === 'function') {
                        setAuthToken(data.token);
                        console.log('✅ Token guardado en contexto');
                    }
                }
               
                // Verificación de auth status
                if (checkAuthStatus && typeof checkAuthStatus === 'function') {
                    console.log('🔄 Forzando verificación de auth status...');
                    await checkAuthStatus();
                }
 
                // Obtener información del usuario
                if (getUserInfo && typeof getUserInfo === 'function') {
                    console.log('📋 Obteniendo información del usuario...');
                    try {
                        await getUserInfo();
                        console.log('✅ Información del usuario obtenida');
                    } catch (userInfoError) {
                        console.log('⚠️ Error obteniendo info del usuario, pero continuando...');
                    }
                }
               
                return { success: true, token: data.token };
            } else {
                console.error('❌ Error generando authToken desde registro:', data.message);
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('❌ Error en generateAuthFromRegistroToken:', error);
            return { success: false, message: 'Error de conexión' };
        } finally {
            setIsLoading(false);
        }
    }, [setAuthToken, checkAuthStatus, getUserInfo]);
 
    /**
     * ✅ NUEVO: Función para generar authToken desde tokenParaMantenerseLogueadoEnElLogin (LOGIN)
     * Esta función se llama después del login con Google
     */
    const generateAuthFromLoginToken = useCallback(async () => {
        try {
            setIsLoading(true);
           
            console.log('🔄 === GENERANDO AUTH DESDE TOKEN DE LOGIN ===');
            console.log('🍪 Cookies disponibles:', document.cookie);
           
            // Verificar si hay tokenParaMantenerseLogueadoEnElLogin
            const hasLoginToken = document.cookie.includes('tokenParaMantenerseLogueadoEnElLogin=');
            console.log('🍪 tokenParaMantenerseLogueadoEnElLogin presente:', hasLoginToken);
           
            if (!hasLoginToken) {
                console.log('⚠️ No se encontró tokenParaMantenerseLogueadoEnElLogin');
                await new Promise(resolve => setTimeout(resolve, 2000));
               
                const hasTokenAfterWait = document.cookie.includes('tokenParaMantenerseLogueadoEnElLogin=');
                if (!hasTokenAfterWait) {
                    return {
                        success: false,
                        message: 'No se encontró token de login. Inténtalo nuevamente.'
                    };
                }
            }
           
            // Hacer petición para generar authToken desde token de login
            const response = await fetch('https://marquesa.onrender.com/api/auth/google/generate-auth-from-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
 
            console.log('📡 Status de respuesta generateAuthFromLogin:', response.status);
 
            const data = await response.json();
            console.log('📦 Respuesta del servidor generateAuthFromLogin:', {
                success: data.success,
                hasToken: !!data.token,
                message: data.message
            });
           
            if (data.success) {
                console.log('✅ AuthToken generado exitosamente desde token de login');
               
                // Manejar token igual que login tradicional
                if (data.token) {
                    console.log('💾 Guardando token generado...');
                   
                    if (setAuthToken && typeof setAuthToken === 'function') {
                        setAuthToken(data.token);
                        console.log('✅ Token guardado en contexto');
                    }
                }
               
                // Verificación de auth status
                if (checkAuthStatus && typeof checkAuthStatus === 'function') {
                    console.log('🔄 Forzando verificación de auth status...');
                    await checkAuthStatus();
                }
 
                // Obtener información del usuario
                if (getUserInfo && typeof getUserInfo === 'function') {
                    console.log('📋 Obteniendo información del usuario...');
                    try {
                        await getUserInfo();
                        console.log('✅ Información del usuario obtenida');
                    } catch (userInfoError) {
                        console.log('⚠️ Error obteniendo info del usuario, pero continuando...');
                    }
                }
               
                return { success: true, token: data.token };
            } else {
                console.error('❌ Error generando authToken desde login:', data.message);
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('❌ Error en generateAuthFromLoginToken:', error);
            return { success: false, message: 'Error de conexión' };
        } finally {
            setIsLoading(false);
        }
    }, [setAuthToken, checkAuthStatus, getUserInfo]);
 
    /**
     * ✅ EDITADO: Completar registro con datos adicionales
     * Ahora usa generateAuthFromRegistroToken después del registro
     */
    const completeGoogleRegistration = useCallback(async (formData) => {
        try {
            setIsLoading(true);
           
            console.log('📝 === COMPLETANDO REGISTRO GOOGLE ===');
            console.log('📦 Datos del formulario:', formData);
           
            const registrationPromise = fetch('https://marquesa.onrender.com/api/auth/google/complete-registration', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });
 
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('TIMEOUT')), 30000);
            });
 
            const response = await Promise.race([registrationPromise, timeoutPromise]);
 
            console.log('📡 Status de respuesta registro:', response.status);
 
            const data = await response.json();
            console.log('📦 Respuesta del servidor registro:', data);
           
            if (data.success) {
                console.log('✅ Registro con Google completado exitosamente');
               
                // ✅ NUEVO: Ahora usar token específico de registro
                console.log('🔄 Generando authToken desde tokenParaMantenerseLogueado...');
                const authResult = await generateAuthFromRegistroToken();
               
                if (authResult.success) {
                    console.log('✅ AuthToken generado exitosamente después del registro');
                   
                    toast.success('¡Registro completado con éxito!');
                   
                    await new Promise(resolve => setTimeout(resolve, 500));
                   
                    setTimeout(() => {
                        console.log('🏠 Redirigiendo a home...');
                        navigate('/home', { replace: true });
                    }, 1000);
                   
                    return { success: true };
                } else {
                    console.error('❌ Error generando authToken después del registro');
                    toast.error('Registro completado pero error en autenticación');
                    return { success: false, message: 'Error en autenticación posterior' };
                }
               
            } else {
                console.error('❌ Error en registro:', data.message);
                toast.error(data.message || 'Error al completar el registro');
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('❌ Error completando registro:', error);
           
            let errorMessage = 'Error de conexión';
           
            if (error.message === 'TIMEOUT') {
                errorMessage = 'La conexión tardó demasiado tiempo. El servidor puede estar ocupado, inténtalo nuevamente en unos momentos.';
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
            } else if (error.message?.includes('timeout')) {
                errorMessage = 'Tiempo de espera agotado. El servidor puede estar ocupado, inténtalo nuevamente.';
            } else if (error.message?.includes('network')) {
                errorMessage = 'Error de red. Verifica tu conexión a internet.';
            }
           
            toast.error(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, [navigate, generateAuthFromRegistroToken]);
 
    /**
     * ✅ EDITADO: Función para manejar el éxito de login con Google
     * Ahora usa generateAuthFromLoginToken
     */
    const handleGoogleLoginSuccess = useCallback(async () => {
        try {
            console.log('🎉 === LOGIN GOOGLE EXITOSO ===');
            console.log('🔄 Generando authToken desde tokenParaMantenerseLogueadoEnElLogin...');
           
            // ✅ NUEVO: Usar token específico de login
            const authResult = await generateAuthFromLoginToken();
           
            if (authResult.success) {
                console.log('✅ AuthToken generado exitosamente desde token de login');
               
                toast.success('¡Inicio de sesión exitoso!');
               
                await new Promise(resolve => setTimeout(resolve, 500));
               
                setTimeout(() => {
                    console.log('🏠 Redirigiendo según tipo de usuario después de login...');
                    navigate('/', { replace: true });
                }, 500);
               
                return { success: true };
            } else {
                console.error('❌ Error generando authToken desde token de login');
                toast.error('Error en el proceso de autenticación');
                return { success: false, message: authResult.message };
            }
           
        } catch (error) {
            console.error('❌ Error procesando login exitoso:', error);
            toast.error('Error procesando el inicio de sesión');
            return { success: false, message: error.message };
        }
    }, [navigate, generateAuthFromLoginToken]);
 
    // ✅ MANTENER: Las demás funciones se mantienen igual
    const validateTempToken = useCallback(async (tempToken) => {
        try {
            console.log('🔍 Validando token temporal de Google...');
           
            const response = await fetch('https://marquesa.onrender.com/api/auth/google/validate-temp-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ tempToken })
            });
 
            const data = await response.json();
           
            if (data.success) {
                console.log('✅ Token temporal válido');
                return { success: true, userData: data.userData };
            } else {
                console.log('❌ Token temporal inválido:', data.message);
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('❌ Error validando token temporal:', error);
            return { success: false, message: 'Error de conexión' };
        }
    }, []);
 
    const refreshGoogleToken = useCallback(async () => {
        try {
            console.log('🔄 Refrescando token de Google...');
           
            const response = await fetch('https://marquesa.onrender.com/api/auth/google/refresh-token', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
 
            const data = await response.json();
           
            if (data.success && data.token) {
                console.log('✅ Token de Google refrescado');
               
                if (setAuthToken && typeof setAuthToken === 'function') {
                    setAuthToken(data.token);
                }
               
                return { success: true, token: data.token };
            } else {
                console.log('❌ Error refrescando token:', data.message);
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('❌ Error refrescando token de Google:', error);
            return { success: false, message: 'Error de conexión' };
        }
    }, [setAuthToken]);
 
    const logoutGoogle = useCallback(async () => {
        try {
            console.log('🚪 Cerrando sesión específica de Google...');
           
            const response = await fetch('https://marquesa.onrender.com/api/auth/google/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
 
            const data = await response.json();
           
            if (data.success) {
                console.log('✅ Sesión de Google cerrada en servidor');
                return { success: true };
            } else {
                console.log('⚠️ Error en logout del servidor, pero continuando...');
                return { success: true, warning: data.message };
            }
        } catch (error) {
            console.error('❌ Error en logout de Google:', error);
            return { success: true, warning: 'Error de conexión, sesión cerrada localmente' };
        }
    }, []);
 
    const getGoogleUserInfo = useCallback(async () => {
        try {
            console.log('📋 Obteniendo información específica de Google...');
           
            const response = await fetch('https://marquesa.onrender.com/api/auth/google/userInfo', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
 
            const data = await response.json();
           
            if (data.success && data.user) {
                console.log('✅ Información de Google obtenida');
               
                if (data.token && setAuthToken && typeof setAuthToken === 'function') {
                    setAuthToken(data.token);
                }
               
                return { success: true, user: data.user };
            } else {
                console.log('❌ Error obteniendo info de Google:', data.message);
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('❌ Error obteniendo información de Google:', error);
            return { success: false, message: 'Error de conexión' };
        }
    }, [setAuthToken]);
 
    return {
        isLoading,
        startGoogleAuth,
        completeGoogleRegistration,
        handleGoogleLoginSuccess,
        // ✅ NUEVAS funciones específicas para tokens independientes
        generateAuthFromRegistroToken,
        generateAuthFromLoginToken,
        // Funciones existentes
        validateTempToken,
        refreshGoogleToken,
        logoutGoogle,
        getGoogleUserInfo
    };
};
 
export default useGoogleAuth;