import React, { useState, useCallback } from 'react';
import { X, User, Phone, Calendar, MapPin, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
 
/**
 * Modal para completar el registro con Google
 * ✅ EDITADO: Ahora maneja emailToken en lugar de solo tempToken
 * Solicita datos adicionales que Google no proporciona
 */
const CompleteGoogleRegistrationModal = ({
    isOpen,
    onClose,
    onSubmit,
    isLoading = false,
    googleUserData = {},
    tempToken = null // ✅ EDITADO: Recibir tempToken directamente como prop
}) => {
    // Estado del formulario
    const [formData, setFormData] = useState({
        phone: '',
        birthDate: '',
        address: ''
    });
 
    // Estado de errores
    const [errors, setErrors] = useState({});
 
    // Validaciones
    const validateField = useCallback((name, value) => {
        switch (name) {
            case 'phone':
                const phoneRegex = /^7\d{3}-\d{4}$/;
                if (!value.trim()) {
                    return 'El teléfono es requerido';
                }
                if (!phoneRegex.test(value)) {
                    return 'Formato: 7XXX-XXXX (ej: 7123-4567)';
                }
                return null;
 
            case 'birthDate':
                if (!value) {
                    return 'La fecha de nacimiento es requerida';
                }
                const today = new Date();
                const birthDate = new Date(value);
                const age = today.getFullYear() - birthDate.getFullYear();
                if (age < 13) {
                    return 'Debes tener al menos 13 años';
                }
                if (age > 120) {
                    return 'Fecha de nacimiento inválida';
                }
                return null;
 
            case 'address':
                if (!value.trim()) {
                    return 'La dirección es requerida';
                }
                if (value.trim().length < 10) {
                    return 'La dirección debe tener al menos 10 caracteres';
                }
                if (value.trim().length > 100) {
                    return 'La dirección no puede exceder 100 caracteres';
                }
                return null;
 
            default:
                return null;
        }
    }, []);
 
    // Manejar cambios en los inputs
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        let processedValue = value;
 
        // Formateo automático para teléfono
        if (name === 'phone') {
            let cleanValue = value.replace(/\D/g, '');
           
            if (cleanValue.length > 0 && !cleanValue.startsWith('7')) {
                if (cleanValue.length <= 7) {
                    cleanValue = '7' + cleanValue;
                }
            }
           
            if (cleanValue.length > 4) {
                cleanValue = cleanValue.slice(0, 4) + '-' + cleanValue.slice(4, 8);
            }
           
            processedValue = cleanValue;
        }
 
        setFormData(prev => ({
            ...prev,
            [name]: processedValue
        }));
 
        // Validación en tiempo real
        const error = validateField(name, processedValue);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    }, [validateField]);
 
    // Validar todo el formulario
    const validateForm = useCallback(() => {
        const newErrors = {};
       
        Object.keys(formData).forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) {
                newErrors[field] = error;
            }
        });
 
        return newErrors;
    }, [formData, validateField]);
 
    // Manejar envío del formulario
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
       
        // Validar formulario
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            const firstError = Object.keys(formErrors)[0];
            const element = document.querySelector(`[name="${firstError}"]`);
            if (element) {
                element.focus();
            }
            return;
        }
 
        // ✅ EDITADO: Usar tempToken de props para completar registro
        console.log('📤 Enviando con tempToken recibido:', tempToken);
       
        if (!tempToken) {
            toast.error('Token de Google no encontrado. Por favor, inicia el proceso nuevamente.');
            onClose();
            return;
        }
 
        // ✅ EDITADO: Preparar datos completos con tempToken
        const completeData = {
            tempToken: tempToken, // ✅ Usar tempToken de props
            phone: formData.phone.trim(),
            birthDate: formData.birthDate,
            address: formData.address.trim()
        };
 
        console.log('📤 Enviando datos completos:', completeData);
 
        // ✅ EDITADO: Llamar función de envío que ahora maneja emailToken
        const result = await onSubmit(completeData);
       
        if (result && result.success) {
            console.log('✅ Registro completado - emailToken debe estar establecido');
            // Limpiar formulario y cerrar
            setFormData({ phone: '', birthDate: '', address: '' });
            setErrors({});
            onClose();
        }
    }, [formData, validateForm, onSubmit, onClose, tempToken]);
 
   // Manejar cierre del modal
   const handleClose = useCallback(() => {
       if (!isLoading) {
           setFormData({ phone: '', birthDate: '', address: '' });
           setErrors({});
           onClose();
       }
   }, [isLoading, onClose]);
 
   // No renderizar si no está abierto
   if (!isOpen) return null;
 
   return (
       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
               
               {/* Header del modal */}
               <div className="flex items-center justify-between p-6 border-b">
                   <div className="flex items-center">
                       <Shield className="w-6 h-6 text-green-500 mr-3" />
                       <h2 className="text-xl font-semibold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                           Completar Registro
                       </h2>
                   </div>
                   <button
                       onClick={handleClose}
                       disabled={isLoading}
                       className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                   >
                       <X className="w-6 h-6" />
                   </button>
               </div>
 
               {/* Información del usuario de Google */}
               <div className="p-6 border-b bg-green-50">
                   <div className="flex items-center">
                       {googleUserData.profilePicture && (
                           <img
                               src={googleUserData.profilePicture}
                               alt="Perfil"
                               className="w-12 h-12 rounded-full mr-4"
                           />
                       )}
                       <div>
                           <p className="font-medium text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                               {googleUserData.fullName || 'Usuario de Google'}
                           </p>
                           <p className="text-sm text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                               {googleUserData.email || ''}
                           </p>
                       </div>
                   </div>
                   <p className="text-sm text-green-700 mt-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                       ✅ Datos obtenidos de Google. Completa la información adicional para finalizar tu registro.
                   </p>
                   
                   {/* ✅ EDITADO: Debug info para desarrollo */}
                   {process.env.NODE_ENV === 'development' && (
                       <div className="mt-2 p-2 bg-blue-100 rounded text-xs">
                           <strong>Debug:</strong> Token presente: {tempToken ? '✅' : '❌'}
                           <br />
                           <strong>EmailToken será creado:</strong> Al completar registro ✅
                       </div>
                   )}
               </div>
 
               {/* Formulario */}
               <form onSubmit={handleSubmit} className="p-6">
                   
                   {/* Campo de teléfono */}
                   <div className="mb-4">
                       <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                           <Phone className="w-4 h-4 inline mr-2" />
                           Teléfono *
                       </label>
                       <div className={`flex items-center bg-white border-2 rounded-lg px-3 py-2 transition-all duration-200 ${
                           errors.phone
                               ? 'border-red-400 bg-red-50'
                               : 'border-gray-300 focus-within:border-green-500'
                       }`}>
                           <input
                               type="tel"
                               name="phone"
                               placeholder="7123-4567"
                               value={formData.phone}
                               onChange={handleInputChange}
                               disabled={isLoading}
                               maxLength={9}
                               className="flex-1 bg-transparent outline-none text-sm"
                               style={{ fontFamily: 'Poppins, sans-serif' }}
                           />
                       </div>
                       {errors.phone && (
                           <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                               {errors.phone}
                           </p>
                       )}
                   </div>
 
                   {/* Campo de fecha de nacimiento */}
                   <div className="mb-4">
                       <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                           <Calendar className="w-4 h-4 inline mr-2" />
                           Fecha de nacimiento *
                       </label>
                       <div className={`flex items-center bg-white border-2 rounded-lg px-3 py-2 transition-all duration-200 ${
                           errors.birthDate
                               ? 'border-red-400 bg-red-50'
                               : 'border-gray-300 focus-within:border-green-500'
                       }`}>
                           <input
                               type="date"
                               name="birthDate"
                               value={formData.birthDate}
                               onChange={handleInputChange}
                               disabled={isLoading}
                               max={new Date(Date.now() - 13 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                               className="flex-1 bg-transparent outline-none text-sm"
                               style={{ fontFamily: 'Poppins, sans-serif' }}
                           />
                       </div>
                       {errors.birthDate && (
                           <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                               {errors.birthDate}
                           </p>
                       )}
                   </div>
 
                   {/* Campo de dirección */}
                   <div className="mb-6">
                       <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                           <MapPin className="w-4 h-4 inline mr-2" />
                           Dirección completa *
                       </label>
                       <div className={`flex items-center bg-white border-2 rounded-lg px-3 py-2 transition-all duration-200 ${
                           errors.address
                               ? 'border-red-400 bg-red-50'
                               : 'border-gray-300 focus-within:border-green-500'
                       }`}>
                           <textarea
                               name="address"
                               placeholder="Ingresa tu dirección completa..."
                               value={formData.address}
                               onChange={handleInputChange}
                               disabled={isLoading}
                               maxLength={100}
                               rows={3}
                               className="flex-1 bg-transparent outline-none text-sm resize-none"
                               style={{ fontFamily: 'Poppins, sans-serif' }}
                           />
                       </div>
                       <div className="flex justify-between mt-1">
                           {errors.address ? (
                               <p className="text-red-500 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                   {errors.address}
                               </p>
                           ) : (
                               <div></div>
                           )}
                           <p className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, sans-serif' }}>
                               {formData.address.length}/100
                           </p>
                       </div>
                   </div>
 
                   {/* ✅ EDITADO: Información actualizada sobre el proceso */}
                   <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                       <p className="text-blue-800 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                           💡 <strong>Información:</strong> Estos datos son necesarios para completar tu perfil.
                           Después del registro, serás autenticado automáticamente usando una sesión segura.
                       </p>
                   </div>
 
                   {/* Botones */}
                   <div className="flex space-x-3">
                       <button
                           type="button"
                           onClick={handleClose}
                           disabled={isLoading}
                           className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                           style={{ fontFamily: 'Poppins, sans-serif' }}
                       >
                           Cancelar
                       </button>
                       <button
                           type="submit"
                           disabled={isLoading || Object.keys(validateForm()).length > 0}
                           className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                           style={{ fontFamily: 'Poppins, sans-serif' }}
                       >
                           {isLoading ? (
                               <>
                                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                   Completando...
                               </>
                           ) : (
                               'Completar Registro'
                           )}
                       </button>
                   </div>
               </form>
           </div>
       </div>
   );
};
 
export default CompleteGoogleRegistrationModal;