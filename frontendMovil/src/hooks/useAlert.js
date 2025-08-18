import { useState } from "react";

/**
 * Hook personalizado para manejar diferentes tipos de alertas y notificaciones
 * Proporciona funcionalidades para mostrar alertas básicas, loading, confirmaciones, inputs y toasts
 */
export const useAlert = () => {
    // Estado principal que contiene todos los tipos de alertas disponibles
    const [alertState, setAlertState] = useState({
        // Configuración para alertas básicas informativas
        basicAlert: {
            visible: false,           // Controla si la alerta está visible
            title: '',               // Título de la alerta
            message: '',             // Mensaje de la alerta
            type: 'info',           // Tipo de alerta (info, success, error, warning)
            onConfirm: null,        // Función callback al confirmar
            onCancel: null,         // Función callback al cancelar
            confirmText: 'OK',      // Texto del botón de confirmación
            cancelText: 'Cancelar', // Texto del botón de cancelación
            showCancel: false,      // Determina si mostrar el botón de cancelar
        },

        // Configuración para indicadores de carga
        loading: {
            visible: false,                    // Controla si el loading está visible
            title: 'Cargando...',            // Título del loading
            message: 'Por favor espera...',   // Mensaje del loading
            color: '#FF69B4',                // Color personalizado del loading
        },

        // Configuración para diálogos de confirmación
        confirmation: {
            visible: false,           // Controla si la confirmación está visible
            title: '',               // Título de la confirmación
            message: '',             // Mensaje de la confirmación
            onConfirm: null,        // Función callback al confirmar
            onCancel: null,         // Función callback al cancelar
            confirmText: 'Confirmar', // Texto del botón de confirmación
            cancelText: 'Cancelar',   // Texto del botón de cancelación
            isDangerous: false,       // Indica si es una acción peligrosa (cambia estilos)
        },

        // Configuración para diálogos de entrada de texto
        input: {
            visible: false,                      // Controla si el input está visible
            title: '',                          // Título del diálogo de input
            message: '',                        // Mensaje del diálogo de input
            placeholder: 'Ingreso el texto...', // Placeholder del campo de input
            value: '',                          // Valor actual del input
            onChangeText: null,                 // Función callback para cambios en el texto
            onCancel: null,                     // Función callback al cancelar
            confirmText: 'Aceptar',            // Texto del botón de confirmación
            cancelText: 'Cancelar',            // Texto del botón de cancelación
            keyboardType: 'default',           // Tipo de teclado para dispositivos móviles
        },

        // Configuración para notificaciones toast (temporales)
        toast: {
            visible: false,    // Controla si el toast está visible
            message: '',       // Mensaje del toast
            type: 'info',     // Tipo de toast (info, success, error, warning)
            duration: 3000,   // Duración en milisegundos antes de ocultarse automáticamente
        },
    });

    /**
     * Muestra una alerta básica con opciones personalizables
     * @param {Object} options - Opciones de configuración de la alerta
     */
    const showAlert = ({
        title,
        message,
        type = 'info',
        onConfirm,
        onCancel,
        confirmText = 'OK',
        cancelText = 'Cancelar',
        showCancel = false,
    }) => {
        setAlertState(prev => ({
            ...prev,
            basicAlert: {
                visible: true,
                title,
                message,
                type,
                onConfirm: onConfirm || hideAlert, // Si no se proporciona onConfirm, usa hideAlert
                onCancel: onCancel || hideAlert,   // Si no se proporciona onCancel, usa hideAlert
                confirmText,
                cancelText,
                showCancel,
            },
        }));
    };

    /**
     * Oculta la alerta básica actual
     */
    const hideAlert = () => {
        setAlertState(prev => ({
            ...prev,
            basicAlert: {...prev.basicAlert, visible: false},
        }));
    };

    /**
     * Muestra un indicador de carga con opciones personalizables
     * @param {Object} options - Opciones de configuración del loading (opcional)
     */
    const showLoading = ({
        title = 'Cargando...',
        message = 'Por favor espera...',
        color = '#FF69B4',
    } = {}) => {
        setAlertState(prev => ({
            ...prev,
            loading: {
                visible: true,
                title,
                message,
                color,
            },
        }));
    };

    /**
     * Oculta el indicador de carga actual
     */
    const hideLoading = () => {
        setAlertState(prev => ({
            ...prev,
            loading: {...prev.loading, visible: false},
        }));
    };

    /**
     * Muestra un diálogo de confirmación
     * @param {Object} options - Opciones de configuración de la confirmación
     */
    const showConfirmation = ({
        title,
        message,
        onConfirm,
        onCancel,
        confirmText = 'Confirmar',
        cancelText = 'Cancelar',
        isDangerous = false,
    }) => {
        setAlertState(prev => ({
            ...prev,
            confirmation: {
                visible: true,
                title,
                message,
                onConfirm: onConfirm || hideConfirmation, // Si no se proporciona onConfirm, usa hideConfirmation
                onCancel: onCancel || hideConfirmation,   // Si no se proporciona onCancel, usa hideConfirmation
                confirmText,
                cancelText,
                isDangerous,
            },
        }));
    };

    /**
     * Oculta el diálogo de confirmación actual
     */
    const hideConfirmation = () => {
        setAlertState(prev => ({
            ...prev,
            confirmation: {...prev.confirmation, visible: false},
        }));
    };

    /**
     * Muestra un diálogo de entrada de texto
     * @param {Object} options - Opciones de configuración del input
     */
    const showInput = ({
        title,
        message,
        placeholder = 'Ingresa el texto...',
        defaultValue = '',
        onConfirm,
        onCancel,
        confirmText = 'Aceptar',
        cancelText = 'Cancelar',
        keyboardType = 'default',
    }) => {
        setAlertState(prev => ({
            ...prev,
            input: {
                visible: true,
                title,
                message, 
                placeholder,
                value: defaultValue,
                // Función para manejar cambios en el texto del input
                onChangeText: (text) => {
                    setAlertState(current => ({
                        ...current,
                        input: {...current.input, value: text},
                    }));
                },
                onConfirm: onConfirm || hideInput, // Si no se proporciona onConfirm, usa hideInput
                onCancel: onCancel || hideInput,   // Si no se proporciona onCancel, usa hideInput
                confirmText,
                cancelText,
                keyboardType,
            },
        }));
    };

    /**
     * Oculta el diálogo de entrada de texto y resetea el valor
     */
    const hideInput = () => {
        setAlertState(prev => ({
            ...prev,
            input: {...prev.input, visible: false, value: ''},
        }));
    };

    /**
     * Muestra una notificación toast temporal
     * @param {Object} options - Opciones de configuración del toast
     */
    const showToast = ({
        message,
        type = 'info',
        duration = 3000,
    }) => {
        setAlertState(prev => ({
            ...prev,
            toast: {
                visible: true,
                message,
                type,
                duration,
            },
        }));
    };

    /**
     * Oculta la notificación toast actual
     */
    const hideToast = () => {
        setAlertState(prev => ({
            ...prev,
            toast: {...prev.toast, visible: false},
        }));
    };

    // Funciones de conveniencia para mostrar alertas de tipos específicos

    /**
     * Muestra una alerta de éxito
     * @param {string} message - Mensaje a mostrar
     * @param {string} title - Título de la alerta (por defecto: 'Éxito')
     */
    const showSuccess = (message, title = 'Éxito') => {
        showAlert({title, message, type: 'success'});
    };

    /**
     * Muestra una alerta de error
     * @param {string} message - Mensaje a mostrar
     * @param {string} title - Título de la alerta (por defecto: 'Error')
     */
    const showError = (message, title = 'Error') => {
        showAlert({title, message, type : 'error'});
    };

    /**
     * Muestra una alerta de advertencia
     * @param {string} message - Mensaje a mostrar
     * @param {string} title - Título de la alerta (por defecto: 'Advertencia')
     */
    const showWarning = (message, title = 'Advertencia') => {
        showAlert({title, message, type: 'warning'});
    };

    /**
     * Muestra una alerta informativa
     * @param {string} message - Mensaje a mostrar
     * @param {string} title - Título de la alerta (por defecto: 'Información')
     */
    const showInfo = (message, title = 'Información') => {
        showAlert({title, message, type: 'info'});
    };

    // Funciones de conveniencia para mostrar toasts de tipos específicos

    /**
     * Muestra un toast de éxito
     * @param {string} message - Mensaje a mostrar
     */
    const showSuccessToast = (message) => {
        showToast({message, type: 'success'});
    };

    /**
     * Muestra un toast de error
     * @param {string} message - Mensaje a mostrar
     */
    const showErrorToast = (message) => {
        showToast({message, type: 'error'});
    };

    /**
     * Muestra un toast de advertencia
     * @param {string} message - Mensaje a mostrar
     */
    const showWarningToast = (message) => {
        showToast({message, type: 'warning'});
    };

    /**
     * Muestra un toast informativo
     * @param {string} message - Mensaje a mostrar
     */
    const showInfoToast = (message) => {
        showToast({message, type: 'info'});
    };

    // Retorna el estado y todas las funciones disponibles para manejar alertas
    return{
        alertState,        // Estado actual de todas las alertas

        // Funciones para alertas básicas
        showAlert,
        hideAlert,
        
        // Funciones para loading
        showLoading,
        hideLoading,
        
        // Funciones para confirmaciones
        showConfirmation,
        hideConfirmation,
        
        // Funciones para inputs
        showInput,
        hideInput,
        
        // Funciones para toasts
        showToast,
        hideToast,

        // Funciones de conveniencia para alertas tipadas
        showSuccess,
        showError,
        showWarning,
        showInfo,
        
        // Funciones de conveniencia para toasts tipados
        showSuccessToast,
        showErrorToast,
        showWarningToast,
        showInfoToast,
    };
};