/**
 * ✅ NUEVO ARCHIVO: Utilidades para tokens de Google Auth
 * Maneja tokens temporales que mantienen el correo para login/registro
 * Ubicación: backend/src/utils/googleTokenUtils.js
 */
import jwt from 'jsonwebtoken';
import { config } from '../config.js';

/**
 * Crea token temporal que mantiene el correo para completar el login
 * @param {string} email - Correo del usuario de Google
 * @param {string} type - Tipo de token ('registro' o 'login')
 * @returns {string} Token temporal
 */
export const createEmailToken = (email, type = 'login') => {
    try {
        const payload = {
            email: email,
            type: type === 'registro' ? 'tokenParaMantenerseLogueado' : 'tokenParaMantenerseLogueadoEnElLogin',
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (30 * 60) // 30 minutos
        };

        const token = jwt.sign(payload, config.JWT.secret);
        console.log(`✅ Token de email creado para ${type}:`, email);
        return token;
    } catch (error) {
        console.error('❌ Error creando token de email:', error);
        throw new Error('Error creando token temporal');
    }
};

/**
 * Verifica y extrae el correo del token temporal
 * @param {string} token - Token temporal a verificar
 * @returns {object} Datos del token o null si es inválido
 */
export const verifyEmailToken = (token) => {
    try {
        const decoded = jwt.verify(token, config.JWT.secret);
        
        if (!decoded.email || (!decoded.type.includes('tokenParaMantenerseLogueado'))) {
            console.log('❌ Token no es de tipo email válido');
            return null;
        }

        console.log('✅ Token de email verificado:', decoded.email);
        return decoded;
    } catch (error) {
        console.error('❌ Error verificando token de email:', error);
        return null;
    }
};