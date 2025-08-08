import { useState } from "react";

export const useAlert = () => {
    const [alertState, setAlertState] = useState({
        basicAlert: {
            visible: false,
            title: '',
            message: '',
            type: 'info',
            onConfirm: null,
            onCancel: null,
            confirmText: 'OK',
            cancelText: 'Cancelar',
            showCancel: false,
        },

        loading: {
            visible: false,
            title: 'Cargando...',
            message: 'Por favor espera...',
            color: '#FF69B4',
        },

        confirmation: {
            visible: false,
            title: '',
            message: '',
            onConfirm: null,
            onCancel: null,
            confirmText: 'Confirmar',
            cancelText: 'Cancelar',
            isDangerous: false,
        },

        input: {
            visible: false,
            title: '',
            message: '',
            placeholder: 'Ingreso el texto...',
            value: '',
            onChangeText: null,
            onCancel: null,
            confirmText: 'Aceptar',
            cancelText: 'Cancelar',
            keyboardType: 'default',
        },

        toast: {
            visible: false,
            message: '',
            type: 'info',
            duration: 3000,
        },
    });

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
                onConfirm: onConfirm || hideAlert,
                onCancel: onCancel || hideAlert,
                confirmText,
                cancelText,
                showCancel,
            },
        }));
    };

    const hideAlert = () => {
        setAlertState(prev => ({
            ...prev,
            basicAlert: {...prev.basicAlert, visible: false},
        }));
    };

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

    const hideLoading = () => {
        setAlertState(prev => ({
            ...prev,
            loading: {...prev.loading, visible: false},
        }));
    };

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
                onConfirm: onConfirm || hideConfirmation,
                onCancel: onCancel || hideConfirmation,
                confirmText,
                cancelText,
                isDangerous,
            },
        }));
    };

    const hideConfirmation = () => {
        setAlertState(prev => ({
            ...prev,
            confirmation: {...prev.confirmation, visible: false},
        }));
    };

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
                onChangeText: (text) => {
                    setAlertState(current => ({
                        ...current,
                        input: {...current.input, value: text},
                    }));
                },
                onConfirm: onConfirm || hideInput,
                onCancel: onCancel || hideInput,
                confirmText,
                cancelText,
                keyboardType,
            },
        }));
    };

    const hideInput = () => {
        setAlertState(prev => ({
            ...prev,
            input: {...prev.input, visible: false, value: ''},
        }));
    };

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

    const hideToast = () => {
        setAlertState(prev => ({
            ...prev,
            toast: {...prev.toast, visible: false},
        }));
    };

    const showSuccess = (message, title = 'Éxito') => {
        showAlert({title, message, type: 'success'});
    };

    const showError = (message, title = 'Error') => {
        showAlert({title, message, type : 'error'});
    };

    const showWarning = (message, title = 'Advertencia') => {
        showAlert({title, message, type: 'warning'});
    };

    const showInfo = (message, title = 'Información') => {
        showAlert({title, message, type: 'info'});
    };

    const showSuccessToast = (message) => {
        showToast({message, type: 'success'});
    };

    const showErrorToast = (message) => {
        showToast({message, type: 'error'});
    };

    const showWarningToast = (message) => {
        showToast({message, type: 'warning'});
    };

    const showInfoToast = (message) => {
        showToast({message, type: 'info'});
    };

    return{
        alertState,

        showAlert,
        hideAlert,
        showLoading,
        hideLoading,
        showConfirmation,
        hideConfirmation,
        showInput,
        hideInput,
        showToast,
        hideToast,

        showSuccess,
        showError,
        showWarning,
        showInfo,
        showSuccessToast,
        showErrorToast,
        showWarningToast,
        showInfoToast,
    };
};