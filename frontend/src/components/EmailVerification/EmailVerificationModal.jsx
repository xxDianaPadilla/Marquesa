import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import CodeInput from './CodeInput';
import { useEmailVerification } from './Hooks/useEmailVerification';

/**
 * Modal para el proceso completo de verificación de email
 * Maneja tres estados del proceso:
 * 1. 'sending' - Enviando código de verificación
 * 2. 'code' - Esperando que el usuario ingrese el código
 * 3. 'verifying' - Verificando código y completando registro
 * 
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Si el modal está visible
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {string} props.email - Email del usuario para verificación
 * @param {string} props.fullName - Nombre completo del usuario
 * @param {Object} props.userData - Datos completos del usuario para registro
 * @param {Function} props.onSuccess - Callback ejecutado cuando la verificación es exitosa
 * @returns {JSX.Element|null} Modal de verificación o null si está cerrado
 */
const EmailVerificationModal = ({ 
    isOpen, 
    onClose, 
    email, 
    fullName, 
    userData,
    onSuccess 
}) => {
    // ============ ESTADOS DEL MODAL ============
    
    /**
     * Estado del proceso de verificación
     * - 'sending': Enviando código al email
     * - 'code': Esperando entrada del código de 6 dígitos
     * - 'verifying': Verificando código y completando registro
     */
    const [step, setStep] = useState('sending');
    
    /**
     * Código de verificación ingresado por el usuario
     * Se actualiza automáticamente desde el componente CodeInput
     */
    const [code, setCode] = useState('');
    
    /**
     * Mensaje de error actual (si existe)
     * Se limpia automáticamente cuando el usuario cambia el código
     */
    const [error, setError] = useState('');
    
    /**
     * Contador para el botón de reenvío de código
     * Cuenta regresiva desde 60 segundos hasta 0
     */
    const [resendTimer, setResendTimer] = useState(0);
    
    // ============ REFERENCIAS ============
    
    /**
     * Referencia al componente CodeInput
     * Permite resetear el código desde el componente padre
     */
    const codeInputRef = useRef();

    // ============ HOOKS PERSONALIZADOS ============
    
    /**
     * Hook para manejar las operaciones de verificación de email
     * Proporciona funciones para enviar y verificar códigos
     */
    const { requestEmailVerification, verifyEmailAndRegister, isLoading } = useEmailVerification();

    // ============ EFECTOS ============
    
    /**
     * Efecto para enviar automáticamente el código cuando se abre el modal
     * Se ejecuta solo cuando el modal se abre y hay un email válido
     */
    useEffect(() => {
        if (isOpen && email) {
            console.log('📧 Modal abierto, enviando código de verificación...');
            sendVerificationCode();
        }
    }, [isOpen, email]);

    /**
     * Efecto para manejar la cuenta regresiva del botón de reenvío
     * Decrementa el contador cada segundo hasta llegar a 0
     */
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer); // Cleanup del timeout
        }
    }, [resendTimer]);

    // ============ FUNCIONES PRINCIPALES ============
    
    /**
     * Envía o reenvía el código de verificación al email del usuario
     * Maneja el estado del modal y los timers de reenvío
     */
    const sendVerificationCode = async () => {
        console.log('📤 Enviando código de verificación...');
        setStep('sending'); // Cambiar a estado de envío
        setError(''); // Limpiar errores previos
        
        // Llamar al hook de verificación para enviar el código
        const result = await requestEmailVerification(email, fullName);
        
        if (result.success) {
            console.log('✅ Código enviado exitosamente');
            setStep('code'); // Cambiar a estado de entrada de código
            setResendTimer(60); // Iniciar cuenta regresiva de 60 segundos
            setCode(''); // Limpiar código anterior
            
            // Resetear el input de código si existe la referencia
            if (codeInputRef.current) {
                codeInputRef.current.resetCode();
            }
        } else {
            console.log('❌ Error al enviar código:', result.message);
            setError(result.message);
            setStep('code'); // Mostrar el input aunque haya error
        }
    };

    /**
     * Maneja los cambios en el código ingresado por el usuario
     * Se ejecuta cada vez que el usuario modifica el código
     * 
     * @param {string} newCode - Nuevo código ingresado
     */
    const handleCodeChange = (newCode) => {
        setCode(newCode);
        setError(''); // Limpiar error al cambiar código
    };

    /**
     * Se ejecuta cuando el usuario completa el código de 6 dígitos
     * Inicia automáticamente el proceso de verificación
     * 
     * @param {string} completeCode - Código completo de 6 dígitos
     */
    const handleCodeComplete = async (completeCode) => {
        console.log('🔍 Código completo ingresado, iniciando verificación...');
        setStep('verifying'); // Cambiar a estado de verificación
        setError(''); // Limpiar errores previos

        // Verificar el código y completar el registro
        const result = await verifyEmailAndRegister(email, completeCode, userData);

        if (result.success) {
            console.log('✅ Verificación exitosa, cerrando modal...');
            // Éxito - notificar al componente padre
            onSuccess();
        } else {
            console.log('❌ Verificación fallida:', result.message);
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
     * Maneja el reenvío manual del código de verificación
     * Solo funciona cuando el timer ha expirado
     */
    const handleResendCode = async () => {
        if (resendTimer > 0) {
            console.log('⏰ Reenvío bloqueado, esperando timer...');
            return; // Bloquear si el timer no ha expirado
        }
        
        console.log('🔄 Reenviando código de verificación...');
        await sendVerificationCode();
    };

    /**
     * Maneja el cierre del modal
     * Solo permite cerrar si no hay operaciones en progreso
     */
    const handleClose = () => {
        if (!isLoading) {
            console.log('❌ Cerrando modal de verificación');
            // Resetear todos los estados
            setStep('sending');
            setCode('');
            setError('');
            setResendTimer(0);
            onClose();
        }
    };

    // ============ RENDERIZADO CONDICIONAL ============
    
    // No renderizar nada si el modal está cerrado
    if (!isOpen) return null;

    // ============ RENDERIZADO DEL MODAL ============
    
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 transform transition-all duration-300 ease-out">
                
                {/* ============ HEADER DEL MODAL ============ */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                        {/* Ícono de email con gradiente */}
                        <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-pink-300 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        
                        {/* Título del modal */}
                        <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Verificar email
                        </h3>
                    </div>
                    
                    {/* Botón para cerrar (solo si no está cargando) */}
                    {!isLoading && (
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                            aria-label="Cerrar modal"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    )}
                </div>

                {/* ============ CONTENIDO DINÁMICO SEGÚN EL ESTADO ============ */}
                <div className="p-6">
                    
                    {/* ---- ESTADO: ENVIANDO CÓDIGO ---- */}
                    {step === 'sending' && (
                        <div className="text-center py-8">
                            {/* Animación de envío con efectos visuales */}
                            <div className="relative">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-pink-400 to-pink-300 rounded-full flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                </div>
                                {/* Efecto de pulsación */}
                                <div className="absolute inset-0 w-16 h-16 mx-auto border-4 border-pink-200 rounded-full animate-ping"></div>
                            </div>
                            
                            {/* Texto informativo */}
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

                    {/* ---- ESTADO: INGRESO DE CÓDIGO ---- */}
                    {step === 'code' && (
                        <div className="text-center">
                            {/* Ícono de confirmación */}
                            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-pink-400 to-pink-300 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            
                            {/* Mensaje de confirmación */}
                            <h4 className="text-lg font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                               Código enviado
                           </h4>
                           <p className="text-gray-600 text-sm mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                               Hemos enviado un código de verificación a<br />
                               <span className="text-pink-600 font-medium">{email}</span>
                           </p>
                           
                           {/* Componente para ingresar el código de 6 dígitos */}
                           <CodeInput
                               ref={codeInputRef}
                               onCodeChange={handleCodeChange}
                               onComplete={handleCodeComplete}
                               disabled={isLoading}
                               error={error}
                           />
                           
                           {/* Botón de reenvío con timer */}
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

                   {/* ---- ESTADO: VERIFICANDO CÓDIGO ---- */}
                   {step === 'verifying' && (
                       <div className="text-center py-8">
                           {/* Animación de verificación con color verde */}
                           <div className="relative">
                               <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-400 to-green-300 rounded-full flex items-center justify-center">
                                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                               </div>
                               {/* Efecto de pulsación verde */}
                               <div className="absolute inset-0 w-16 h-16 mx-auto border-4 border-green-200 rounded-full animate-ping"></div>
                           </div>
                           
                           {/* Texto de verificación */}
                           <h4 className="text-lg font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                               Verificando código...
                           </h4>
                           <p className="text-gray-600 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                               Estamos completando tu registro
                           </p>
                       </div>
                   )}
               </div>

               {/* ============ FOOTER DEL MODAL ============ */}
               <div className="px-6 pb-6">
                   <div className="bg-gray-50 rounded-lg p-4 text-center">
                       {/* Información adicional para el usuario */}
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