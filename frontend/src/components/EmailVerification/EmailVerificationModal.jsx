import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import CodeInput from './CodeInput';
import { useEmailVerification } from './Hooks/useEmailVerification';

/**
 * Modal para verificación de email
 * Muestra estados de carga, input de código y manejo de errores
 */
const EmailVerificationModal = ({ 
    isOpen, 
    onClose, 
    email, 
    fullName, 
    userData,
    onSuccess 
}) => {
    const [step, setStep] = useState('sending'); // 'sending', 'code', 'verifying'
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(0);
    const codeInputRef = useRef();

    const { requestEmailVerification, verifyEmailAndRegister, isLoading } = useEmailVerification();

    // Efecto para enviar el código inicialmente
    useEffect(() => {
        if (isOpen && email) {
            sendVerificationCode();
        }
    }, [isOpen, email]);

    // Timer para reenvío
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    /**
     * Envía el código de verificación
     */
    const sendVerificationCode = async () => {
        setStep('sending');
        setError('');
        
        const result = await requestEmailVerification(email, fullName);
        
        if (result.success) {
            setStep('code');
            setResendTimer(60); // 60 segundos para reenvío
            setCode(''); // Limpiar código anterior
            // Resetear el input de código si existe
            if (codeInputRef.current) {
                codeInputRef.current.resetCode();
            }
        } else {
            setError(result.message);
            setStep('code'); // Mostrar el input aunque haya error
        }
    };

    /**
     * Maneja el cambio en el código
     * @param {string} newCode - Nuevo código ingresado
     */
    const handleCodeChange = (newCode) => {
        setCode(newCode);
        setError(''); // Limpiar error al cambiar código
    };

    /**
     * Maneja cuando el código está completo
     * @param {string} completeCode - Código completo de 6 dígitos
     */
    const handleCodeComplete = async (completeCode) => {
        setStep('verifying');
        setError('');

        const result = await verifyEmailAndRegister(email, completeCode, userData);

        if (result.success) {
            // Éxito - cerrar modal y notificar
            onSuccess();
        } else {
            // Error - mostrar mensaje y volver al input
            setError(result.message);
            setStep('code');
            setCode(''); // Limpiar código
            // Resetear el input de código
            if (codeInputRef.current) {
                codeInputRef.current.resetCode();
            }
        }
    };

    /**
     * Maneja el reenvío de código
     */
    const handleResendCode = async () => {
        if (resendTimer > 0) return;
        await sendVerificationCode();
    };

    /**
     * Maneja el cierre del modal
     */
    const handleClose = () => {
        if (!isLoading) {
            setStep('sending');
            setCode('');
            setError('');
            setResendTimer(0);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 transform transition-all duration-300 ease-out">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-pink-300 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Verificar email
                        </h3>
                    </div>
                    
                    {!isLoading && (
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    )}
                </div>

                {/* Contenido */}
                <div className="p-6">
                    
                    {/* Estado: Enviando */}
                    {step === 'sending' && (
                        <div className="text-center py-8">
                            <div className="relative">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-pink-400 to-pink-300 rounded-full flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                </div>
                                <div className="absolute inset-0 w-16 h-16 mx-auto border-4 border-pink-200 rounded-full animate-ping"></div>
                            </div>
                            
                            <h4 className="text-lg font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Enviando correo...
                            </h4>
                            <p className="text-gray-600 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Estamos enviando el código de verificación a
                            </p>
                            <p className="text-pink-600 font-medium text-sm mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {email}
                            </p>
                        </div>
                    )}

                    {/* Estado: Ingreso de código */}
                    {step === 'code' && (
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-pink-400 to-pink-300 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            
                            <h4 className="text-lg font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                               Código enviado
                           </h4>
                           <p className="text-gray-600 text-sm mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                               Hemos enviado un código de verificación a<br />
                               <span className="text-pink-600 font-medium">{email}</span>
                           </p>
                           
                           <CodeInput
                               ref={codeInputRef}
                               onCodeChange={handleCodeChange}
                               onComplete={handleCodeComplete}
                               disabled={isLoading}
                               error={error}
                           />
                           
                           {/* Botón de reenvío */}
                           <div className="mt-6">
                               <button
                                   onClick={handleResendCode}
                                   disabled={resendTimer > 0 || isLoading}
                                   className="text-sm text-pink-600 hover:text-pink-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                                   style={{ fontFamily: 'Poppins, sans-serif' }}
                               >
                                   {resendTimer > 0 
                                       ? `Reenviar código en ${resendTimer}s`
                                       : '¿No recibiste el código? Reenviar'
                                   }
                               </button>
                           </div>
                       </div>
                   )}

                   {/* Estado: Verificando */}
                   {step === 'verifying' && (
                       <div className="text-center py-8">
                           <div className="relative">
                               <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-400 to-green-300 rounded-full flex items-center justify-center">
                                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                               </div>
                               <div className="absolute inset-0 w-16 h-16 mx-auto border-4 border-green-200 rounded-full animate-ping"></div>
                           </div>
                           
                           <h4 className="text-lg font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                               Verificando código...
                           </h4>
                           <p className="text-gray-600 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                               Estamos completando tu registro
                           </p>
                       </div>
                   )}
               </div>

               {/* Footer */}
               <div className="px-6 pb-6">
                   <div className="bg-gray-50 rounded-lg p-4 text-center">
                       <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                           El código expira en 10 minutos. Si no lo recibes, 
                           revisa tu carpeta de spam o correo no deseado.
                       </p>
                   </div>
               </div>
           </div>
       </div>
   );
};

export default EmailVerificationModal;