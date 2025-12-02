import React from 'react';

interface AvatarProps {
  name?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Avatar: React.FC<AvatarProps> = ({ name = 'User', size = 'md' }) => {
  const initials = name.substring(0, 2).toUpperCase();
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold ring-2 ring-white shadow-sm shrink-0`}>
      {initials}
    </div>
  );
};