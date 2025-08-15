import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import Clients from '../models/Clients.js';
import { config } from '../config.js';
// ✅ EDITADO: Importar nuevas funciones específicas
import {
    createTokenParaMantenerseLogueado,
    createTokenParaMantenerseLogueadoEnElLogin,
    verifyEmailToken,
    generateAuthTokenFromEmail
} from '../utils/googleTokenUtils.js';
 
// ✅ CORRECCIÓN CRÍTICA: Función para configurar cookies cross-domain IGUAL que loginController
const getCookieConfig = () => {
    const isProduction = process.env.NODE_ENV === 'production';
 
    console.log('🍪 [GoogleAuth] Configurando cookies para entorno:', isProduction ? 'PRODUCTION' : 'DEVELOPMENT');
 
    if (isProduction) {
        // ✅ CONFIGURACIÓN CROSS-DOMAIN OPTIMIZADA PARA PRODUCCIÓN - IGUAL QUE LOGIN TRADICIONAL
        return {
            httpOnly: true, // ✅ CRÍTICO: httpOnly true para seguridad (IGUAL que login tradicional)
            secure: true,   // ✅ HTTPS obligatorio en producción
            sameSite: 'none', // ✅ Permitir cookies cross-domain
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
            path: '/',
            // ✅ NO especificar domain para permitir cross-domain
        };
    } else {
        // Configuración para desarrollo local - IGUAL que login tradicional
        return {
            httpOnly: true, // ✅ CRÍTICO: httpOnly true también en desarrollo
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/',
        };
    }
};
 
const googleAuthController = {
    /**
     * ✅ EDITADO: Verifica si el usuario de Google ya existe y maneja el flujo de autenticación
     * CAMBIO: Ahora crea tokenParaMantenerseLogueadoEnElLogin independiente del tempToken
     */
    checkGoogleUser: async (req, res) => {
        try {
            console.log('🔍 === GOOGLE AUTH CALLBACK ===');
            console.log('🌍 Entorno:', process.env.NODE_ENV);
            console.log('🔗 Origin:', req.headers.origin);
            console.log('👤 Usuario de Passport:', req.user);
 
            if (!req.user) {
                console.error('❌ No hay datos de usuario de Passport');
                return res.redirect('https://marquesa.vercel.app/login?google_auth=error&message=no_user_data');
            }
 
            const { googleId, email, fullName, profilePicture } = req.user;
 
            if (!googleId || !email) {
                console.error('❌ Datos de Google incompletos:', req.user);
                return res.redirect('https://marquesa.vercel.app/login?google_auth=error&message=incomplete_data');
            }
 
            console.log('🔍 Buscando usuario existente con email:', email);
 
            // Buscar usuario existente por email o googleId
            let existingUser = await Clients.findOne({
                $or: [
                    { email: email },
                    { googleId: googleId }
                ]
            });
 
            if (existingUser) {
                console.log('✅ Usuario existente encontrado');
 
                // Si el usuario existe pero no tiene googleId, actualizarlo
                if (!existingUser.googleId) {
                    existingUser.googleId = googleId;
                    existingUser.provider = 'google';
                    if (profilePicture && !existingUser.profilePicture) {
                        existingUser.profilePicture = profilePicture;
                    }
                    await existingUser.save();
                    console.log('✅ Usuario actualizado con datos de Google');
                }
 
                // ✅ NUEVO: Crear tokenParaMantenerseLogueadoEnElLogin INDEPENDIENTE
                const tokenLogin = createTokenParaMantenerseLogueadoEnElLogin(email);
 
                // ✅ NUEVO: Establecer cookie con token de login independiente
                const cookieConfig = getCookieConfig();
                res.cookie('tokenParaMantenerseLogueadoEnElLogin', tokenLogin, cookieConfig);
                console.log('🍪 tokenParaMantenerseLogueadoEnElLogin establecido para login');
 
                console.log('✅ Login exitoso con Google para usuario existente');
               
                // ✅ CAMBIO: Redirigir con parámetro indicando que hay token de login
                return res.redirect(`https://marquesa.vercel.app/login?google_auth=success&existing_user=true&has_login_token=true`);
               
            } else {
                console.log('📝 Usuario nuevo, necesita completar registro');
 
                // Crear token temporal para completar registro (este se mantiene igual)
                const tempToken = jwt.sign(
                    {
                        type: 'google_temp',
                        googleId,
                        email,
                        fullName,
                        profilePicture,
                        exp: Math.floor(Date.now() / 1000) + (15 * 60) // 15 minutos
                    },
                    config.JWT.secret
                );
 
                // Redirigir a registro con todos los datos en la URL
                const encodedData = encodeURIComponent(JSON.stringify({
                    fullName,
                    email,
                    profilePicture: profilePicture || ''
                }));
 
                console.log('📝 Redirigiendo a completar registro');
                return res.redirect(`https://marquesa.vercel.app/register?google_auth=true&temp_token=${tempToken}&google_data=${encodedData}`);
            }
        } catch (error) {
            console.error('❌ Error en checkGoogleUser:', error);
            return res.redirect('https://marquesa.vercel.app/login?google_auth=error&message=server_error');
        }
    },
 
    /**
     * ✅ EDITADO: Completa el registro de un usuario de Google con datos adicionales
     * CAMBIO: Ahora crea tokenParaMantenerseLogueado INDEPENDIENTE después del registro
     */
    completeGoogleRegistration: async (req, res) => {
        try {
            console.log('📝 === COMPLETANDO REGISTRO GOOGLE ===');
            console.log('🌍 Entorno:', process.env.NODE_ENV);
            console.log('🔗 Origin:', req.headers.origin);
            console.log('📦 Body recibido:', req.body);
 
            const { tempToken, phone, birthDate, address } = req.body;
 
            if (!tempToken || !phone || !birthDate || !address) {
                return res.status(400).json({
                    success: false,
                    message: 'Todos los campos son requeridos'
                });
            }
 
            // Verificar y decodificar token temporal
            let tempData;
            try {
                tempData = jwt.verify(tempToken, config.JWT.secret);
                console.log('✅ Token temporal válido:', {
                    type: tempData.type,
                    email: tempData.email,
                    fullName: tempData.fullName
                });
            } catch (error) {
                console.error('❌ Token temporal inválido:', error);
                return res.status(401).json({
                    success: false,
                    message: 'Token temporal expirado o inválido'
                });
            }
 
            if (tempData.type !== 'google_temp') {
                return res.status(401).json({
                    success: false,
                    message: 'Token temporal inválido'
                });
            }
 
            // Verificar que el email no esté ya registrado
            const existingUser = await Clients.findOne({ email: tempData.email });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'Este email ya está registrado'
                });
            }
 
            // Validar formato de teléfono
            const phoneRegex = /^7\d{3}-\d{4}$/;
            if (!phoneRegex.test(phone)) {
                return res.status(400).json({
                    success: false,
                    message: 'Formato de teléfono inválido. Use: 7XXX-XXXX'
                });
            }
 
            // Validar fecha de nacimiento
            const today = new Date();
            const birth = new Date(birthDate);
            const age = today.getFullYear() - birth.getFullYear();
            if (age < 13) {
                return res.status(400).json({
                    success: false,
                    message: 'Debes tener al menos 13 años para registrarte'
                });
            }
 
            // Generar contraseña temporal aleatoria (el usuario no la necesita)
            const tempPassword = await bcryptjs.hash(Math.random().toString(36).slice(-8), 10);
 
            // Crear nuevo usuario
            const newUser = new Clients({
                fullName: tempData.fullName,
                email: tempData.email,
                phone: phone.trim(),
                birthDate: new Date(birthDate),
                address: address.trim(),
                password: tempPassword, // Contraseña temporal
                googleId: tempData.googleId,
                provider: 'google',
                profilePicture: tempData.profilePicture || '',
                favorites: []
            });
 
            await newUser.save();
            console.log('✅ Usuario de Google registrado:', newUser.email);
 
            // ✅ NUEVO: Crear tokenParaMantenerseLogueado INDEPENDIENTE del tempToken
            const tokenRegistro = createTokenParaMantenerseLogueado(tempData.email);
 
            // ✅ NUEVO: Configurar cookie con token de registro independiente
            const cookieConfig = getCookieConfig();
            res.cookie('tokenParaMantenerseLogueado', tokenRegistro, cookieConfig);
            console.log('🍪 tokenParaMantenerseLogueado establecido para registro');
 
            // ✅ CORRECCIÓN: Headers específicos para cross-domain IGUAL que loginController
            if (process.env.NODE_ENV === 'production') {
                res.header('Access-Control-Allow-Credentials', 'true');
                res.header('Access-Control-Allow-Origin', 'https://marquesa.vercel.app');
                res.header('Access-Control-Expose-Headers', 'Set-Cookie');
                console.log('🌐 Headers cross-domain configurados');
            }
 
            console.log('🎉 Registro con Google completado exitosamente');
 
            // ✅ CAMBIO: Respuesta indicando que hay token de registro
            return res.status(201).json({
                success: true,
                message: 'Registro completado con éxito',
                user: {
                    id: newUser._id,
                    userType: 'Customer',
                    email: newUser.email,
                    fullName: newUser.fullName
                },
                // ✅ NUEVO: Indicar que hay token de registro en cookie
                hasRegistroToken: true
            });
 
        } catch (error) {
            console.error('❌ Error completando registro de Google:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    },
 
    // ✅ NUEVO: Función para generar authToken desde tokenParaMantenerseLogueado (REGISTRO)
    generateAuthFromRegistroToken: async (req, res) => {
        try {
            console.log('🔄 === GENERANDO AUTH DESDE TOKEN DE REGISTRO ===');
           
            // Obtener token de registro desde cookies
            const registroToken = req.cookies?.tokenParaMantenerseLogueado;
           
            if (!registroToken) {
                console.log('❌ tokenParaMantenerseLogueado no encontrado');
                return res.status(401).json({
                    success: false,
                    message: 'Token de registro no encontrado'
                });
            }
 
            // Verificar token de registro
            const registroData = verifyEmailToken(registroToken, 'tokenParaMantenerseLogueado');
            if (!registroData) {
                console.log('❌ tokenParaMantenerseLogueado inválido');
                return res.status(401).json({
                    success: false,
                    message: 'Token de registro inválido o expirado'
                });
            }
 
            console.log('✅ tokenParaMantenerseLogueado válido para:', registroData.email);
 
            // Generar authToken desde email
            const authResult = await generateAuthTokenFromEmail(registroData.email, Clients);
           
            if (!authResult.success) {
                return res.status(404).json({
                    success: false,
                    message: authResult.message
                });
            }
 
            // Configurar cookie con authToken
            const cookieConfig = getCookieConfig();
            res.cookie('authToken', authResult.token, cookieConfig);
           
            // Limpiar token de registro ya usado
            res.clearCookie('tokenParaMantenerseLogueado');
            console.log('✅ AuthToken establecido y token de registro limpiado');
 
            // Headers cross-domain
            if (process.env.NODE_ENV === 'production') {
                res.header('Access-Control-Allow-Credentials', 'true');
                res.header('Access-Control-Allow-Origin', 'https://marquesa.vercel.app');
                res.header('Access-Control-Expose-Headers', 'Set-Cookie');
            }
 
            // Respuesta igual que loginController
            const tokenExpiry = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);
           
            return res.status(200).json({
                success: true,
                message: 'Autenticación generada exitosamente desde registro',
                token: authResult.token,
                tokenExpiry: tokenExpiry,
                user: authResult.user,
                sessionInfo: {
                    loginTime: new Date().toISOString(),
                    expiresIn: '7 days',
                    provider: 'google',
                    persistent: true,
                    source: 'registro'
                },
                cookieSet: true
            });
 
        } catch (error) {
            console.error('❌ Error generando auth desde token de registro:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    },
 
    // ✅ NUEVO: Función para generar authToken desde tokenParaMantenerseLogueadoEnElLogin (LOGIN)
    generateAuthFromLoginToken: async (req, res) => {
        try {
            console.log('🔄 === GENERANDO AUTH DESDE TOKEN DE LOGIN ===');
           
            // Obtener token de login desde cookies
            const loginToken = req.cookies?.tokenParaMantenerseLogueadoEnElLogin;
           
            if (!loginToken) {
                console.log('❌ tokenParaMantenerseLogueadoEnElLogin no encontrado');
                return res.status(401).json({
                    success: false,
                    message: 'Token de login no encontrado'
                });
            }
 
            // Verificar token de login
            const loginData = verifyEmailToken(loginToken, 'tokenParaMantenerseLogueadoEnElLogin');
            if (!loginData) {
                console.log('❌ tokenParaMantenerseLogueadoEnElLogin inválido');
                return res.status(401).json({
                    success: false,
                    message: 'Token de login inválido o expirado'
                });
            }
 
            console.log('✅ tokenParaMantenerseLogueadoEnElLogin válido para:', loginData.email);
 
            // Generar authToken desde email
            const authResult = await generateAuthTokenFromEmail(loginData.email, Clients);
           
            if (!authResult.success) {
                return res.status(404).json({
                    success: false,
                    message: authResult.message
                });
            }
 
            // Configurar cookie con authToken
            const cookieConfig = getCookieConfig();
            res.cookie('authToken', authResult.token, cookieConfig);
           
            // Limpiar token de login ya usado
            res.clearCookie('tokenParaMantenerseLogueadoEnElLogin');
            console.log('✅ AuthToken establecido y token de login limpiado');
 
            // Headers cross-domain
            if (process.env.NODE_ENV === 'production') {
                res.header('Access-Control-Allow-Credentials', 'true');
                res.header('Access-Control-Allow-Origin', 'https://marquesa.vercel.app');
                res.header('Access-Control-Expose-Headers', 'Set-Cookie');
            }
 
            // Respuesta igual que loginController
            const tokenExpiry = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);
           
            return res.status(200).json({
                success: true,
                message: 'Autenticación generada exitosamente desde login',
                token: authResult.token,
                tokenExpiry: tokenExpiry,
                user: authResult.user,
                sessionInfo: {
                    loginTime: new Date().toISOString(),
                    expiresIn: '7 days',
                    provider: 'google',
                    persistent: true,
                    source: 'login'
                },
                cookieSet: true
            });
 
        } catch (error) {
            console.error('❌ Error generando auth desde token de login:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    },
 
    // ✅ MANTENER: Las demás funciones se mantienen igual...
    validateTempToken: async (req, res) => {
        try {
            const { tempToken } = req.body;
 
            if (!tempToken) {
                return res.status(400).json({
                    success: false,
                    message: 'Token temporal requerido'
                });
            }
 
            // Verificar y decodificar token temporal
            let tempData;
            try {
                tempData = jwt.verify(tempToken, config.JWT.secret);
            } catch (error) {
                return res.status(401).json({
                    success: false,
                    message: 'Token temporal inválido o expirado',
                    error: error.name
                });
            }
 
            if (tempData.type !== 'google_temp') {
                return res.status(401).json({
                    success: false,
                    message: 'Token temporal no es de Google'
                });
            }
 
            // Verificar que el email no esté ya registrado
            const existingUser = await Clients.findOne({ email: tempData.email });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'Este email ya está registrado',
                    userExists: true
                });
            }
 
            // Token válido y usuario no existe
            return res.status(200).json({
                success: true,
                message: 'Token temporal válido',
                userData: {
                    email: tempData.email,
                    fullName: tempData.fullName,
                    profilePicture: tempData.profilePicture
                },
                expiresIn: tempData.exp - Math.floor(Date.now() / 1000)
            });
 
        } catch (error) {
            console.error('❌ Error validando token temporal:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    },
 
    // Las demás funciones (refreshGoogleToken, logoutGoogle, getGoogleUserInfo) se mantienen igual...
    refreshGoogleToken: async (req, res) => {
        try {
            console.log('🔄 === REFRESCANDO TOKEN GOOGLE ===');
 
            // ✅ CRÍTICO: Obtener token IGUAL que loginController (cookies Y headers)
            let currentToken = req.cookies.authToken;
            if (!currentToken) {
                const authHeader = req.headers.authorization;
                if (authHeader && authHeader.startsWith('Bearer ')) {
                    currentToken = authHeader.substring(7);
                }
            }
 
            if (!currentToken) {
                return res.status(401).json({
                    success: false,
                    message: 'Token de autenticación requerido'
                });
            }
 
            // Verificar token actual
            let decoded;
            try {
                decoded = jwt.verify(currentToken, config.JWT.secret);
            } catch (error) {
                return res.status(401).json({
                    success: false,
                    message: 'Token inválido o expirado'
                });
            }
 
            // Buscar usuario en la base de datos
            const user = await Clients.findById(decoded.id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }
 
            // ✅ CRÍTICO: Generar nuevo token IGUAL que loginController
            const newToken = jwt.sign(
                {
                    id: user._id,
                    email: user.email,
                    userType: 'Customer'
                },
                config.JWT.secret,
                { expiresIn: config.JWT.expires || '7d' }
            );
 
            // ✅ CORRECCIÓN: Configurar nueva cookie IGUAL que loginController
            const cookieConfig = getCookieConfig();
            res.cookie('authToken', newToken, cookieConfig);
 
            console.log('✅ Token de Google refrescado exitosamente');
 
            // ✅ CRÍTICO: Respuesta IGUAL que loginController
            return res.status(200).json({
                success: true,
                message: 'Token refrescado exitosamente',
                token: newToken,
                tokenExpiry: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    userType: 'Customer'
                }
            });
 
        } catch (error) {
            console.error('❌ Error refrescando token de Google:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    },
 
    logoutGoogle: async (req, res) => {
        try {
            console.log('🚪 Cerrando sesión de Google...');
 
            // ✅ CORRECCIÓN: Limpiar cookie EXACTAMENTE igual que logoutController
            const cookieConfig = getCookieConfig();
            res.clearCookie('authToken', {
                httpOnly: cookieConfig.httpOnly,
                secure: cookieConfig.secure,
                sameSite: cookieConfig.sameSite,
                path: cookieConfig.path
            });
 
            // Limpiar también tokens de email si existen
            res.clearCookie('tokenParaMantenerseLogueado', {
                httpOnly: cookieConfig.httpOnly,
                secure: cookieConfig.secure,
                sameSite: cookieConfig.sameSite,
                path: cookieConfig.path
            });
 
            res.clearCookie('tokenParaMantenerseLogueadoEnElLogin', {
                httpOnly: cookieConfig.httpOnly,
                secure: cookieConfig.secure,
                sameSite: cookieConfig.sameSite,
                path: cookieConfig.path
            });
 
            return res.status(200).json({
                success: true,
                message: 'Sesión de Google cerrada exitosamente',
                timestamp: new Date().toISOString()
            });
 
        } catch (error) {
            console.error('❌ Error cerrando sesión de Google:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    },
 
    getGoogleUserInfo: async (req, res) => {
        try {
            console.log('📋 Obteniendo información del usuario de Google...');
 
            // ✅ CRÍTICO: Obtener token IGUAL que loginController (cookies Y headers)
            let token = req.cookies.authToken;
            if (!token) {
                const authHeader = req.headers.authorization;
                if (authHeader && authHeader.startsWith('Bearer ')) {
                    token = authHeader.substring(7);
                }
            }
 
            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'Token de autenticación requerido'
                });
            }
 
            // Verificar token
            let decoded;
            try {
                decoded = jwt.verify(token, config.JWT.secret);
            } catch (error) {
                return res.status(401).json({
                    success: false,
                    message: 'Token inválido o expirado'
               });
           }
 
           // Buscar usuario en la base de datos
           const user = await Clients.findById(decoded.id).select('-password');
           if (!user) {
               return res.status(404).json({
                   success: false,
                   message: 'Usuario no encontrado'
               });
           }
 
           // Verificar que sea usuario de Google
           if (user.provider !== 'google' || !user.googleId) {
               return res.status(400).json({
                   success: false,
                   message: 'Usuario no es de Google'
               });
           }
 
           // ✅ CRÍTICO: Respuesta IGUAL que loginController.getUserInfo
           return res.status(200).json({
               success: true,
               message: 'Información del usuario obtenida exitosamente',
               token: token, // ✅ CRÍTICO: Incluir token en respuesta IGUAL que loginController
               user: {
                   id: user._id,
                   name: user.fullName, // ✅ CRÍTICO: usar 'name' IGUAL que loginController
                   email: user.email,
                   phone: user.phone,
                   address: user.address,
                   birthDate: user.birthDate,
                   profilePicture: user.profilePicture,
                   favorites: user.favorites,
                   discount: user.discount,
                   userType: 'Customer', // ✅ CRÍTICO: userType consistente
                   createdAt: user.createdAt,
                   // Información específica de Google
                   googleId: user.googleId,
                   provider: user.provider
               }
           });
 
       } catch (error) {
           console.error('❌ Error obteniendo información del usuario de Google:', error);
           return res.status(500).json({
               success: false,
               message: 'Error interno del servidor'
           });
       }
   }
};
 
export default googleAuthController;