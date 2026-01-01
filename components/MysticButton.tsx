
import React from 'react';

interface MysticButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
  disabled?: boolean;
}

export const MysticButton: React.FC<MysticButtonProps> = ({ 
  onClick, 
  children, 
  variant = 'primary',
  className = '',
  disabled = false
}) => {
  const baseStyles = "px-6 py-2 rounded-full font-mystic transition-all duration-200 transform active:scale-90 disabled:opacity-20 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none";
  
  const variants = {
    primary: "bg-indigo-700 hover:bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] disabled:hover:bg-indigo-700",
    secondary: "bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-900 disabled:hover:bg-slate-800",
    danger: "bg-red-900/40 hover:bg-red-900/60 text-red-200 border border-red-800 disabled:hover:bg-red-900/40"
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};
