import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  headerControls?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  title, 
  children, 
  className = '', 
  headerControls = true 
}) => {
  return (
    <div className={`bg-cyber-card border-2 border-cyber-border shadow-cyber-glow flex flex-col relative ${className}`}>
      {/* Cyberpunk corner crosshairs */}
      <div className="absolute -top-1.5 -left-1.5 w-3 h-3 text-cyber-border font-bold select-none pointer-events-none">+</div>
      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 text-cyber-border font-bold select-none pointer-events-none">+</div>
      <div className="absolute -bottom-2 -left-1.5 w-3 h-3 text-cyber-border font-bold select-none pointer-events-none">+</div>
      <div className="absolute -bottom-2 -right-1.5 w-3 h-3 text-cyber-border font-bold select-none pointer-events-none">+</div>

      {/* Header Bar */}
      {(title || headerControls) && (
        <div className="flex items-center justify-between border-b border-cyber-darkborder bg-cyber-bg px-3 py-2 select-none">
          <div className="flex items-center space-x-2">
            {title && (
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyber-text text-glow">
                &gt;_ {title}
              </span>
            )}
          </div>
          {headerControls && (
            <div className="flex space-x-1.5 text-cyber-subtext text-[10px] font-mono">
              <span className="cursor-pointer hover:text-cyber-text">[MIN]</span>
              <span className="cursor-pointer hover:text-cyber-text">[MAX]</span>
              <span className="cursor-pointer hover:text-cyber-text">[X]</span>
            </div>
          )}
        </div>
      )}
      
      {/* Content */}
      <div className="p-4 flex-1">
        {children}
      </div>
    </div>
  );
};
