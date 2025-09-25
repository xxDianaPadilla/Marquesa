import fetch from "node-fetch";
import { config } from "../config.js";

const apiKey = config.brevo.brevo_api;

/**
 * Servicio de envío de correos usando Brevo API
 * Refactorizado para ser reutilizable en todo el proyecto
 */

/**
 * Función principal para enviar correos electrónicos usando Brevo
 * @param {Object} emailData - Datos del correo a enviar
 * @param {Object} emailData.sender - Información del remitente
 * @param {string} emailData.sender.name - Nombre del remitente
 * @param {string} emailData.sender.email - Email del remitente
 * @param {Array} emailData.to - Array de destinatarios
 * @param {string} emailData.to[].email - Email del destinatario
 * @param {string} emailData.to[].name - Nombre del destinatario (opcional)
 * @param {string} emailData.subject - Asunto del correo
 * @param {string} emailData.htmlContent - Contenido HTML del correo
 * @param {string} [emailData.textContent] - Contenido de texto plano (opcional)
 * @returns {Promise<Object>} - Resultado del envío
 */
export const sendEmail = async (emailData) => {
    try {
        console.log('=== INICIO envío con Brevo ===');
        console.log('Destinatario:', emailData.to[0]?.email);
        console.log('Asunto:', emailData.subject);
        console.log('Timestamp:', new Date().toISOString());

        // Validar que tenemos la API key
        if (!apiKey) {
            throw new Error('API key de Brevo no configurada - verificar variables de entorno');
        }

        // Validar datos requeridos
        if (!emailData.to || !emailData.to.length || !emailData.to[0].email) {
            throw new Error('Destinatario es requerido');
        }

        if (!emailData.subject) {
            throw new Error('Asunto es requerido');
        }

        if (!emailData.htmlContent) {
            throw new Error('Contenido HTML es requerido');
        }

        // Preparar payload para Brevo
        const payload = {
            sender: emailData.sender || {
                name: "Marquesa - Tienda de Regalos",
                email: config.emailUser.user_email || "noreply@marquesa.com"
            },
            to: emailData.to,
            subject: emailData.subject,
            htmlContent: emailData.htmlContent
        };

        // Agregar contenido de texto si está presente
        if (emailData.textContent) {
            payload.textContent = emailData.textContent;
        }

        console.log('Enviando petición a Brevo API...');

        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "api-key": apiKey,
                "content-type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        console.log('Respuesta de Brevo:', {
            status: response.status,
            statusText: response.statusText,
            data: data
        });

        if (response.ok) {
            console.log('✅ Email enviado exitosamente via Brevo');
            console.log('Message ID:', data.messageId);
            console.log('=== FIN envío con Brevo ===');
            
            return {
                success: true,
                messageId: data.messageId,
                data: data
            };
        } else {
            // Error de la API de Brevo
            console.error('❌ Error de Brevo API:', data);
            throw new Error(data.message || `Error HTTP ${response.status}: ${response.statusText}`);
        }

    } catch (error) {
        console.error('❌ Error en sendEmail:', {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });

        // Re-lanzar error con información más detallada
        const enhancedError = new Error(error.message);
        enhancedError.originalError = error;
        enhancedError.service = 'brevo';
        
        throw enhancedError;
    }
};

/**
 * Función helper específica para emails de verificación
 * @param {string} email - Email del destinatario
 * @param {string} verificationCode - Código de verificación
 * @param {string} fullName - Nombre completo del usuario (opcional)
 * @param {string} htmlTemplate - Template HTML personalizado
 * @returns {Promise<Object>} - Resultado del envío
 */
export const sendVerificationEmail = async (email, verificationCode, fullName, htmlTemplate) => {
    const emailData = {
        to: [{ 
            email: email, 
            name: fullName || undefined 
        }],
        subject: '🌸 Verifica tu correo electrónico - Marquesa',
        htmlContent: htmlTemplate
    };

    return await sendEmail(emailData);
};

/**
 * Función helper específica para emails de recuperación de contraseña
 * @param {string} email - Email del destinatario
 * @param {string} resetCode - Código de recuperación
 * @param {string} fullName - Nombre completo del usuario (opcional)
 * @param {string} htmlTemplate - Template HTML personalizado
 * @returns {Promise<Object>} - Resultado del envío
 */
export const sendPasswordResetEmail = async (email, resetCode, fullName, htmlTemplate) => {
    const emailData = {
        to: [{ 
            email: email, 
            name: fullName || undefined 
        }],
        subject: '🔐 Recuperación de contraseña - Marquesa',
        htmlContent: htmlTemplate
    };

    return await sendEmail(emailData);
};

/**
 * Función de prueba para verificar conectividad con Brevo
 * @returns {Promise<boolean>} - True si la conexión es exitosa
 */
export const testBrevoConnection = async () => {
    try {
        const testEmail = {
            to: [{ email: "test@test.com", name: "Test User" }],
            subject: "Test de conexión",
            htmlContent: "<p>Este es un email de prueba</p>"
        };

        // Hacer la petición pero no enviar realmente
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "api-key": apiKey,
                "content-type": "application/json"
            },
            body: JSON.stringify(testEmail)
        });

        return response.status < 500; // API accesible
    } catch (error) {
        console.error('Error testando conexión Brevo:', error);
        return false;
    }
};

export default {
    sendEmail,
    sendVerificationEmail,
    sendPasswordResetEmail,
    testBrevoConnection
};