import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { config } from "../config.js";

// ✅ CORRECCIÓN CRÍTICA: Configurar la estrategia de Google OAuth con mejor manejo de errores
passport.use(new GoogleStrategy({
    clientID: config.google.clientId,
    clientSecret: config.google.clientSecret,
    callbackURL: config.google.callbackUrl,
    // ✅ NUEVO: Configuraciones adicionales para mejorar la compatibilidad
    passReqToCallback: false, // No necesitamos req en el callback
    scope: ['profile', 'email'], // Explícitamente definir scopes
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log('🔍 === PASSPORT GOOGLE STRATEGY ===');
        console.log('📋 Profile ID:', profile.id);
        console.log('📧 Email:', profile.emails?.[0]?.value);
        console.log('👤 Display Name:', profile.displayName);
        console.log('🖼️ Photo:', profile.photos?.[0]?.value);

        // ✅ VALIDACIÓN CRÍTICA: Verificar datos esenciales
        if (!profile.id) {
            console.error('❌ Google Profile ID faltante');
            return done(new Error('Google Profile ID is required'), null);
        }

        if (!profile.emails || profile.emails.length === 0) {
            console.error('❌ Email de Google faltante');
            return done(new Error('Google email is required'), null);
        }

        if (!profile.displayName) {
            console.error('❌ Display name de Google faltante');
            return done(new Error('Google display name is required'), null);
        }

        // ✅ MEJORADO: Extraer información del perfil de Google con validaciones
        const googleData = {
            googleId: profile.id,
            fullName: profile.displayName,
            email: profile.emails[0].value,
            profilePicture: profile.photos?.[0]?.value || '', // Foto opcional
            provider: 'google',
            // ✅ NUEVO: Información adicional para debugging
            accessToken: accessToken ? 'present' : 'missing',
            refreshToken: refreshToken ? 'present' : 'missing',
            profileRaw: {
                id: profile.id,
                provider: profile.provider,
                emails: profile.emails.map(email => email.value),
                photos: profile.photos?.map(photo => photo.value) || []
            }
        };

        console.log('✅ Datos de Google procesados exitosamente:', {
            googleId: googleData.googleId,
            email: googleData.email,
            fullName: googleData.fullName,
            hasProfilePicture: !!googleData.profilePicture,
            provider: googleData.provider
        });

        // ✅ CRÍTICO: Devolver los datos para procesamiento posterior
        return done(null, googleData);

    } catch (error) {
        console.error('❌ Error crítico en estrategia de Google:', error);
        console.error('❌ Stack trace:', error.stack);

        // ✅ MEJORADO: Error más descriptivo
        const errorMessage = error.message || 'Unknown error in Google strategy';
        return done(new Error(`Google Auth Error: ${errorMessage}`), null);
    }
}));

// ✅ MEJORADO: Serialización con mejor logging y manejo de errores
passport.serializeUser((user, done) => {
    try {
        console.log('📦 Serializando usuario:', {
            email: user.email,
            googleId: user.googleId,
            provider: user.provider
        });

        // ✅ CRÍTICO: Serializar todo el objeto del usuario para el callback
        done(null, user);
    } catch (error) {
        console.error('❌ Error serializando usuario:', error);
        done(error, null);
    }
});

// ✅ MEJORADO: Deserialización con mejor logging y manejo de errores
passport.deserializeUser((user, done) => {
    try {
        console.log('📤 Deserializando usuario:', {
            email: user?.email,
            googleId: user?.googleId,
            provider: user?.provider
        });

        // ✅ VALIDACIÓN: Verificar que el usuario tenga datos mínimos
        if (!user || !user.googleId || !user.email) {
            console.error('❌ Usuario deserializado inválido:', user);
            return done(new Error('Invalid user data in session'), null);
        }

        done(null, user);
    } catch (error) {
        console.error('❌ Error deserializando usuario:', error);
        done(error, null);
    }
});

// ✅ NUEVO: Función de utilidad para verificar configuración
export const verifyGoogleConfig = () => {
    const errors = [];

    if (!config.google?.clientId) {
        errors.push('Google Client ID is missing');
    }

    if (!config.google?.clientSecret) {
        errors.push('Google Client Secret is missing');
    }

    if (!config.google?.callbackUrl) {
        errors.push('Google Callback URL is missing');
    }

    if (errors.length > 0) {
        console.error('❌ Errores de configuración de Google:', errors);
        throw new Error(`Google OAuth configuration errors: ${errors.join(', ')}`);
    }

    console.log('✅ Configuración de Google OAuth verificada correctamente');
    console.log('🔗 Callback URL:', config.google.callbackUrl);

    return true;
};

// ✅ NUEVO: Verificar configuración al importar
try {
    verifyGoogleConfig();
} catch (error) {
    console.error('❌ CRITICAL: Google OAuth mal configurado:', error.message);
}

export default passport;