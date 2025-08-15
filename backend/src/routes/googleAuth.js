import express from 'express';
import passport from '../config/passport.js';
import googleAuthController from '../controllers/googleAuthController.js';
 
const router = express.Router();
 
/**
 * ✅ CORRECCIÓN CRÍTICA: Middleware para configurar headers cross-domain
 * Esto debe ejecutarse ANTES de cualquier manejo de cookies
 */
const setCrossDomainHeaders = (req, res, next) => {
    // ✅ CRÍTICO: Headers específicos para cookies cross-domain
    if (process.env.NODE_ENV === 'production') {
        res.header('Access-Control-Allow-Origin', 'https://marquesa.vercel.app');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');
        res.header('Access-Control-Expose-Headers', 'Set-Cookie');
    }
   
    console.log('🌐 Headers cross-domain configurados para Google Auth');
    next();
};
 
/**
 * ✅ CORRECCIÓN CRÍTICA: Middleware personalizado para el callback
 * Maneja la autenticación y configuración de cookies correctamente
 */
const handleGoogleCallback = (req, res, next) => {
    passport.authenticate('google', (err, user, info) => {
        if (err) {
            console.error('❌ Error en autenticación de Google:', err);
            return res.redirect('https://marquesa.vercel.app/login?google_auth=error&message=authentication_error');
        }
       
        if (!user) {
            console.error('❌ No se obtuvo usuario de Google');
            return res.redirect('https://marquesa.vercel.app/login?google_auth=error&message=no_user_data');
        }
       
        // ✅ CRÍTICO: Establecer usuario en la request para el controlador
        req.user = user;
       
        console.log('✅ Usuario de Google autenticado correctamente:', {
            email: user.email,
            name: user.fullName
        });
       
        // Continuar al controlador
        next();
    })(req, res, next);
};
 
/**
 * Ruta para iniciar autenticación con Google
 * GET /api/auth/google
 */
router.get('/google',
    setCrossDomainHeaders, // ✅ NUEVO: Headers cross-domain
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })
);
 
/**
 * ✅ CORREGIDA: Ruta de callback de Google con manejo mejorado
 * GET /api/auth/google/callback
 */
router.get('/google/callback',
    setCrossDomainHeaders, // ✅ NUEVO: Headers cross-domain ANTES del callback
    handleGoogleCallback, // ✅ NUEVO: Manejo personalizado del callback
    googleAuthController.checkGoogleUser // ✅ CORREGIDO: Ahora recibe req.user correctamente
);
 
/**
 * Ruta para completar registro con datos adicionales
 * POST /api/auth/google/complete-registration
 */
router.post('/google/complete-registration',
    setCrossDomainHeaders, // ✅ NUEVO: Headers cross-domain
    googleAuthController.completeGoogleRegistration
);
 
/**
 * ✅ NUEVA RUTA: Generar authToken desde tokenParaMantenerseLogueado (REGISTRO)
 * POST /api/auth/google/generate-auth-from-registro
 */
router.post('/google/generate-auth-from-registro',
    setCrossDomainHeaders,
    googleAuthController.generateAuthFromRegistroToken
);
 
/**
 * ✅ NUEVA RUTA: Generar authToken desde tokenParaMantenerseLogueadoEnElLogin (LOGIN)
 * POST /api/auth/google/generate-auth-from-login
 */
router.post('/google/generate-auth-from-login',
    setCrossDomainHeaders,
    googleAuthController.generateAuthFromLoginToken
);
 
/**
 * Ruta para validar token temporal de Google
 * POST /api/auth/google/validate-temp-token
 */
router.post('/google/validate-temp-token',
    setCrossDomainHeaders,
    googleAuthController.validateTempToken
);
 
/**
 * Ruta para refrescar token de Google
 * POST /api/auth/google/refresh-token
 */
router.post('/google/refresh-token',
    setCrossDomainHeaders,
    googleAuthController.refreshGoogleToken
);
 
/**
 * Ruta para logout específico de Google
 * POST /api/auth/google/logout
 */
router.post('/google/logout',
    setCrossDomainHeaders,
    googleAuthController.logoutGoogle
);
 
/**
 * Ruta para obtener información del usuario de Google
 * GET /api/auth/google/user-info
 */
router.get('/google/user-info',
    setCrossDomainHeaders,
    googleAuthController.getGoogleUserInfo
);
 
/**
 * ✅ NUEVO: Manejo de OPTIONS para preflight requests
 */
router.options('*', setCrossDomainHeaders, (req, res) => {
    res.status(200).end();
});
 
export default router;