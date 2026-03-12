import React, { useState } from 'react';

const Avatar = ({ src, alt, size = 'md', className = '' }) => {
    const [error, setError] = useState(false);

    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-11 h-11',
        xl: 'w-16 h-16',
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    if (error || !src) {
        return (
            <div className={`${sizeClasses[size]} rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold border border-indigo-500/20 ${className}`}>
                <span className={size === 'sm' ? 'text-xs' : 'text-sm'}>
                    {getInitials(alt)}
                </span>
            </div>
        );
    }

    return (
        <div className={`${sizeClasses[size]} rounded-xl overflow-hidden border border-zinc-800 ${className}`}>
            <img
                src={src}
                alt={alt}
                className="w-full h-full object-cover"
                onError={() => setError(true)}
            />
        </div>
    );
};

export default Avatar;
