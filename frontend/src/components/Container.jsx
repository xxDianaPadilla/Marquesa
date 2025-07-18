// frontend/src/components/Container.jsx
import React from 'react';

const Container = ({ 
    children, 
    size = 'default',
    padding = 'default',
    className = '' 
}) => {
    const sizes = {
        sm: 'max-w-4xl',
        default: 'max-w-6xl',
        lg: 'max-w-7xl',
        xl: 'max-w-8xl',
        full: 'max-w-full'
    };

    const paddings = {
        none: '',
        sm: 'px-2 sm:px-4',
        default: 'px-4 sm:px-6 lg:px-8',
        lg: 'px-6 sm:px-8 lg:px-12'
    };

    return (
        <div className={`${sizes[size]} mx-auto ${paddings[padding]} ${className}`}>
            {children}
        </div>
    );
};

export default Container;