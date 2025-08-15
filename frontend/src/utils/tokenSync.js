/**
 * ✅ NUEVA UTILIDAD: Sincronización de tokens entre diferentes fuentes
 * Maneja la sincronización entre URL, localStorage, cookies y memoria
 * Ubicación: frontend/src/utils/tokenSync.js
 */

/**
 * Extrae token de parámetros de URL (para Google Auth redirects)
 */
export const extractTokenFromURL = () => {
    try {
        if (typeof window === 'undefined') return null;
        
        console.log('🔍 Buscando token en URL...');
        
        // Buscar en hash de la URL (después de #)
        const hash = window.location.hash;
        if (hash && hash.includes('token=')) {
            const hashParams = new URLSearchParams(hash.substring(1));
            const token = hashParams.get('token');
            if (token) {
                console.log('✅ Token encontrado en URL hash');
                // Limpiar URL después de extraer el token
                window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
                return token;
            }
        }
        
        // Buscar en query parameters (después de ?)
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        if (token) {
            console.log('✅ Token encontrado en URL query');
            // Limpiar URL después de extraer el token
            window.history.replaceState({}, document.title, window.location.pathname);
            return token;
        }
        
        console.log('❌ No se encontró token en URL');
        return null;
    } catch (error) {
        console.error('❌ Error extrayendo token de URL:', error);
        return null;
    }
};

/**
 * Decodifica un token JWT sin verificar la firma
 */
export const decodeJWT = (token) => {
    try {
        if (!token || typeof token !== 'string') return null;
        
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        
        const payload = parts[1];
        const decodedPayload = atob(payload);
        const parsedPayload = JSON.parse(decodedPayload);
        
        // Verificar que tenga los campos requeridos
        if (!parsedPayload.id || !parsedPayload.exp) return null;
        
        // Verificar que no esté expirado
        const currentTime = Math.floor(Date.now() / 1000);
        if (parsedPayload.exp <= currentTime) {
            console.log('❌ Token expirado');
            return null;
        }
        
        return parsedPayload;
    } catch (error) {
        console.error('❌ Error decodificando token:', error);
        return null;
    }
};

/**
 * Sincroniza un token recién obtenido con todas las fuentes de almacenamiento
 */
export const syncTokenToStorage = (token, userData = null) => {
    try {
        console.log('💾 Sincronizando token a localStorage...');
        
        if (!token) {
            console.error('❌ No se proporcionó token para sincronizar');
            return false;
        }
        
        // Decodificar token para obtener información
        const decoded = decodeJWT(token);
        if (!decoded) {
            console.error('❌ Token inválido para sincronizar');
            return false;
        }
        
        // Preparar datos de usuario
        const userDataToStore = userData || {
            id: decoded.id,
            userType: decoded.userType || 'Customer',
            email: decoded.email
        };
        
        // Guardar en localStorage
        if (typeof window !== 'undefined' && window.localStorage) {
            try {
                localStorage.setItem('auth_token_marquesa', token);
                localStorage.setItem('auth_user_marquesa', JSON.stringify(userDataToStore));
                localStorage.setItem('auth_expiry_marquesa', decoded.exp.toString());
                console.log('✅ Token sincronizado en localStorage');
                return true;
            } catch (error) {
                console.error('❌ Error guardando en localStorage:', error);
                return false;
            }
        }
        
        return false;
    } catch (error) {
        console.error('❌ Error sincronizando token:', error);
        return false;
    }
};

/**
 * Verifica si hay una sesión válida en localStorage
 */
export const hasValidStoredSession = () => {
    try {
        if (typeof window === 'undefined' || !window.localStorage) return false;
        
        const token = localStorage.getItem('auth_token_marquesa');
        const expiryStr = localStorage.getItem('auth_expiry_marquesa');
        const userStr = localStorage.getItem('auth_user_marquesa');
        
        if (!token || !expiryStr || !userStr) return false;
        
        // Verificar expiración
        const expiry = parseInt(expiryStr);
        const now = Math.floor(Date.now() / 1000);
        
        if (now >= expiry) {
            // Limpiar si está expirado
            clearStoredSession();
            return false;
        }
        
        // Verificar que los datos de usuario sean válidos
        try {
            const userData = JSON.parse(userStr);
            if (!userData.id) return false;
        } catch {
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('❌ Error verificando sesión almacenada:', error);
        return false;
    }
};

/**
 * Limpia completamente la sesión almacenada
 */
export const clearStoredSession = () => {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.removeItem('auth_token_marquesa');
            localStorage.removeItem('auth_user_marquesa');
            localStorage.removeItem('auth_expiry_marquesa');
            console.log('🧹 Sesión almacenada limpiada');
        }
    } catch (error) {
        console.error('❌ Error limpiando sesión:', error);
    }
};

/**
 * Obtiene el token almacenado si es válido
 */
export const getStoredToken = () => {
    try {
        if (!hasValidStoredSession()) return null;
        
        return localStorage.getItem('auth_token_marquesa');
    } catch (error) {
        console.error('❌ Error obteniendo token almacenado:', error);
        return null;
    }
};

/**
 * Obtiene los datos de usuario almacenados
 */
export const getStoredUserData = () => {
    try {
        if (!hasValidStoredSession()) return null;
        
        const userStr = localStorage.getItem('auth_user_marquesa');
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        console.error('❌ Error obteniendo datos de usuario almacenados:', error);
        return null;
    }
};

/**
 * Maneja la sincronización inicial al cargar la aplicación
 * Busca tokens en URL y los sincroniza con localStorage
 */
export const handleInitialTokenSync = async () => {
    try {
        console.log('🔄 Manejando sincronización inicial de tokens...');
        
        // Buscar token en URL (primera prioridad para Google Auth)
        const urlToken = extractTokenFromURL();
        if (urlToken) {
            console.log('🎯 Token encontrado en URL, sincronizando...');
            const success = syncTokenToStorage(urlToken);
            if (success) {
                console.log('✅ Token de URL sincronizado exitosamente');
                return { found: true, source: 'url', token: urlToken };
            }
        }
        
        // Verificar si ya hay una sesión válida almacenada
        if (hasValidStoredSession()) {
            const storedToken = getStoredToken();
            console.log('✅ Sesión válida encontrada en localStorage');
            return { found: true, source: 'localStorage', token: storedToken };
        }
        
        console.log('❌ No se encontró token válido en ninguna fuente');
        return { found: false, source: null, token: null };
        
    } catch (error) {
        console.error('❌ Error en sincronización inicial:', error);
        return { found: false, source: null, token: null };
    }
};

// Exportación por defecto con todas las funciones
export default {
    extractTokenFromURL,
    decodeJWT,
    syncTokenToStorage,
    hasValidStoredSession,
    clearStoredSession,
    getStoredToken,
    getStoredUserData,
    handleInitialTokenSync
};