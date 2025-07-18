import React, { useRef } from 'react';

const MessageInput = ({
    value,
    onChange,
    onSend,
    onFileSelect,
    disabled = false,
    placeholder = "Escribe un mensaje...",
    compact = false
}) => {
    const fileInputRef = useRef(null);

    // Manejar envío del formulario
    const handleSubmit = (e) => {
        e.preventDefault();
        if (value?.trim()) {
            onSend(value);
        }
    };

    // Manejar presionar Enter
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (value?.trim()) {
                onSend(value);
            }
        }
    };

    // Manejar selección de archivo
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && onFileSelect) {
            // Crear preview para imágenes
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    onFileSelect(file, e.target.result);
                };
                reader.readAsDataURL(file);
            } else {
                onFileSelect(file, null);
            }
        }
    };

    const inputClasses = compact 
        ? "flex-1 border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#E8ACD2] focus:border-transparent"
        : "flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8ACD2] focus:border-transparent";

    return (
        <div className={`${compact ? 'p-2' : 'p-3 md:p-4'} border-t border-gray-200 bg-white flex-shrink-0`}>
            <form onSubmit={handleSubmit} className="flex items-end space-x-2 md:space-x-3">
                {/* Botón de archivo */}
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-shrink-0 p-2 text-gray-500 hover:text-[#E8ACD2] transition-colors"
                    title="Adjuntar archivo"
                    disabled={disabled}
                >
                    <svg className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                </button>
                
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                    className="hidden"
                />
                
                {/* Input de texto */}
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={placeholder}
                    className={inputClasses}
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                    disabled={disabled}
                />
                
                <button
                    type="submit"
                    disabled={!value?.trim() || disabled}
                    className={`flex-shrink-0 ${compact ? 'px-2 py-2' : 'px-3 md:px-4 py-2'} bg-[#E8ACD2] text-white rounded-lg hover:bg-[#E096C8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                    <svg className={`${compact ? 'w-3 h-3' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </form>
        </div>
    );
};

export default MessageInput;