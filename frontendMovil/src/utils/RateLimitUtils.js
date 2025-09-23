// Utilidades para el manejo del sistema de límite de intentos de login
// Este archivo contiene funciones auxiliares para gestionar el bloqueo de cuentas

// Configuración del sistema de límite de intentos
export const RATE_LIMIT_CONFIG = {
    maxAttempts: 5, // Máximo número de intentos fallidos permitidos
    lockoutDuration: 15 * 60, // Duración del bloqueo en segundos (15 minutos)
    warningThreshold: 3 // Número de intentos después del cual se muestra advertencia
};

// Almacenamiento en memoria para los intentos de login fallidos
const loginAttempts = new Map();

// Clase con utilidades para el manejo del sistema de límite de intentos
export class RateLimitUtils {
    // Genera una clave única para almacenar los intentos por email
    static getStorageKey(email) {
        return `login_attempts_${email.toLowerCase()}`;
    }

    // Obtiene los datos de intentos almacenados para un email
    static getAttemptData(email) {
        const key = this.getStorageKey(email);
        return loginAttempts.get(key) || { attempts: 0, lockedUntil: null };
    }

    // Guarda los datos de intentos para un email
    static saveAttemptData(email, data) {
        const key = this.getStorageKey(email);
        loginAttempts.set(key, data);
    }

    // Verifica si una cuenta está bloqueada
    static isAccountLocked(email) {
        const data = this.getAttemptData(email);
        if (!data.lockedUntil) return false;

        const now = Date.now();
        if (now >= data.lockedUntil) {
            // El bloqueo ha expirado, limpiar los datos
            this.clearAttempts(email);
            return false;
        }
        return true;
    }

    // Obtiene el tiempo restante de bloqueo en segundos
    static getRemainingLockTime(email) {
        const data = this.getAttemptData(email);
        if (!data.lockedUntil) return 0;

        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((data.lockedUntil - now) / 1000));
        return remaining;
    }

    // Registra un intento fallido y determina si se debe bloquear la cuenta
    static recordFailedAttempt(email) {
        const data = this.getAttemptData(email);
        const newAttempts = data.attempts + 1;

        let newData = {
            attempts: newAttempts,
            lockedUntil: data.lockedUntil,
            lastAttempt: Date.now()
        };

        // Si se alcanza el máximo de intentos, bloquear la cuenta
        if (newAttempts >= RATE_LIMIT_CONFIG.maxAttempts) {
            const lockDuration = RATE_LIMIT_CONFIG.lockoutDuration * 1000;
            newData.lockedUntil = Date.now() + lockDuration;
        }

        this.saveAttemptData(email, newData);
        return newData;
    }

    // Limpia los intentos después de un login exitoso
    static clearAttempts(email) {
        const key = this.getStorageKey(email);
        loginAttempts.delete(key);
    }

    // Formatea el tiempo restante en un formato legible
    static formatRemainingTime(seconds) {
        if (seconds <= 0) return '';

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }

    // Obtiene un mensaje de advertencia sobre intentos restantes
    static getAttemptsWarning(email) {
        const data = this.getAttemptData(email);

        if (data.attempts >= RATE_LIMIT_CONFIG.warningThreshold &&
            data.attempts < RATE_LIMIT_CONFIG.maxAttempts) {
            const remaining = RATE_LIMIT_CONFIG.maxAttempts - data.attempts;
            return `Te quedan ${remaining} intento${remaining === 1 ? '' : 's'} antes de que tu cuenta sea bloqueada temporalmente.`;
        }
        return null;
    }

    // Obtiene información completa del estado de bloqueo
    static getLockoutInfo(email) {
        if (!email) return { isLocked: false };

        const cleanEmail = email.trim().toLowerCase();
        const isLocked = this.isAccountLocked(cleanEmail);

        if (isLocked) {
            const remainingTime = this.getRemainingLockTime(cleanEmail);
            const formattedTime = this.formatRemainingTime(remainingTime);

            return {
                isLocked: true,
                remainingTime: remainingTime,
                formattedTime: formattedTime,
                message: `Tu cuenta está temporalmente bloqueada. Tiempo restante: ${formattedTime}`
            };
        }

        return { isLocked: false };
    }

    // Obtiene estadísticas de intentos para mostrar progreso
    static getAttemptsProgress(email) {
        if (!email) return null;

        const cleanEmail = email.trim().toLowerCase();
        const data = this.getAttemptData(cleanEmail);

        if (data.attempts > 0) {
            const percentage = (data.attempts / RATE_LIMIT_CONFIG.maxAttempts) * 100;
            const remaining = RATE_LIMIT_CONFIG.maxAttempts - data.attempts;

            return {
                attempted: data.attempts,
                remaining: remaining,
                maxAttempts: RATE_LIMIT_CONFIG.maxAttempts,
                percentage: percentage,
                isNearLimit: data.attempts >= RATE_LIMIT_CONFIG.warningThreshold
            };
        }

        return null;
    }
}

// Exportar configuración por defecto
export default RateLimitUtils;