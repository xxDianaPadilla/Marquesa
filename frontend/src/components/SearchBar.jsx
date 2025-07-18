// frontend/src/components/SearchBar.jsx
import React from 'react';

const SearchBar = ({ 
    value, 
    onChange, 
    placeholder = "Buscar...", 
    onClear,
    className = '',
    disabled = false 
}) => {
    return (
        <div className={`flex-1 relative ${className}`}>
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent text-xs sm:text-sm lg:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: "Poppins, sans-serif" }}
            />
            <svg
                className="absolute left-2 sm:left-3 top-2.5 w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
            </svg>
            {value && onClear && (
                <button
                    onClick={() => onClear()}
                    className="absolute right-2 sm:right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                    style={{ cursor: 'pointer' }}
                    disabled={disabled}
                >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
};

export default SearchBar;