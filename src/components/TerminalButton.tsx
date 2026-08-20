import React from 'react';

interface TerminalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
}

export const TerminalButton: React.FC<TerminalButtonProps> = ({ 
  children, 
  className = '', 
  variant = 'primary', 
  ...props 
}) => {
  const baseStyle = "px-4 py-2 font-mono text-sm uppercase tracking-wider font-bold transition-all relative border border-2 select-none active:translate-y-0.5";
  
  const variantStyles = {
    primary: "border-cyber-border text-cyber-text hover:bg-cyber-border hover:text-black shadow-cyber-glow hover:shadow-cyber-glow-strong bg-transparent",
    secondary: "border-cyber-subtext text-cyber-subtext hover:border-cyber-text hover:text-cyber-text bg-transparent",
    danger: "border-cyber-red text-cyber-red hover:bg-cyber-red hover:text-black shadow-cyber-glow-red bg-transparent",
    success: "border-cyber-green text-cyber-green hover:bg-cyber-green hover:text-black shadow-cyber-glow-green bg-transparent"
  };

  return (
    <button 
      className={`${baseStyle} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {/* Visual indicator corner cuts */}
      <span className="absolute top-0 left-0 w-1 h-1 bg-black"></span>
      <span className="absolute top-0 right-0 w-1 h-1 bg-black"></span>
      <span className="absolute bottom-0 left-0 w-1 h-1 bg-black"></span>
      <span className="absolute bottom-0 right-0 w-1 h-1 bg-black"></span>
      
      {children}
    </button>
  );
};
