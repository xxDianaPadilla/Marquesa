/**
 * Plantilla HTML para el email de recuperación de contraseña
 * Código de verificación de 6 dígitos
 * Nombre completo del usuario (opcional)
 * HTML template del email
 */

// Plantilla HTML para el email de recuperación
export const getEmailTemplate = (verificationCode) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Recuperación de Contraseña - Marquesa</title>
        <style>
            body { margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f8f9fa; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #FDB4B7 0%, #F2C6C2 100%); padding: 40px 20px; text-align: center; }
            .logo { color: #FFFFFF; font-size: 28px; font-weight: bold; letter-spacing: 3px; margin-bottom: 10px; }
            .subtitle { color: #FFFFFF; font-size: 14px; opacity: 0.9; }
            .content { padding: 40px 30px; text-align: center; }
            .title { color: #333333; font-size: 24px; font-weight: 600; margin-bottom: 20px; }
            .message { color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
            .code-container { background-color: #FADDDD; border-radius: 10px; padding: 25px; margin: 30px 0; }
            .code { font-size: 36px; font-weight: bold; color: #333333; letter-spacing: 8px; margin-bottom: 10px; }
            .code-label { color: #666666; font-size: 14px; }
            .timer { background-color: #F2C6C2; color: #FFFFFF; padding: 15px; border-radius: 8px; margin: 20px 0; font-weight: 600; }
            .footer { background-color: #f8f9fa; padding: 30px; text-align: center; color: #999999; font-size: 14px; }
            .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">● MARQUESA ●</div>
                <div class="subtitle">TIENDA DE REGALOS</div>
            </div>
            
            <div class="content">
                <h1 class="title">Recuperación de Contraseña</h1>
                <p class="message">
                    Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. 
                    Utiliza el siguiente código de verificación para continuar con el proceso:
                </p>
                
                <div class="code-container">
                    <div class="code">${verificationCode}</div>
                    <div class="code-label">Código de Verificación</div>
                </div>
                
                <div class="timer">
                    ⏰ Este código expira en 5 minutos
                </div>
                
                <div class="warning">
                    <strong>⚠️ Importante:</strong> Si no solicitaste este cambio, ignora este correo. 
                    Tu contraseña permanecerá sin cambios.
                </div>
                
                <p class="message">
                    Por tu seguridad, nunca compartas este código con nadie. El equipo de Marquesa 
                    nunca te pedirá tu código de verificación por teléfono o email.
                </p>
            </div>
            
            <div class="footer">
                <p>© 2025 Marquesa - Tienda de Regalos</p>
                <p>Este es un email automático, por favor no respondas a este mensaje.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};