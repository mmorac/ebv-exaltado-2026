import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  // Added 'hover-vibrate', 'subpixel-antialiased' and 'transform-gpu' for sharpness and effect
  const baseStyles = "px-6 py-3 rounded-full font-bold transition-all duration-300 transform active:scale-95 shadow-md flex items-center justify-center gap-2 font-display tracking-wide hover-vibrate subpixel-antialiased transform-gpu";
  
  // Updated Colors:
  // Primary -> Sky Blue (Replaces Pistachio/Emerald)
  // Secondary -> Violet (Purple elements)
  // Outline -> Bordered Violet
  const variants = {
    primary: "bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/30",
    secondary: "bg-violet-600 hover:bg-violet-700 text-white shadow-violet-600/30",
    outline: "border-4 border-violet-200 text-violet-700 hover:bg-violet-50 hover:border-violet-300"
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthClass} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};