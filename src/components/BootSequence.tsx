"use client";

import React, { useState, useEffect } from 'react';
import { Terminal } from 'lucide-react';

export function BootSequence() {
  const [booting, setBooting] = useState(true);
  const [visible, setVisible] = useState(true);
  const [lines, setLines] = useState<string[]>([]);
  
  useEffect(() => {
    // Only run the boot sequence once per session
    const hasBooted = sessionStorage.getItem('wds_booted');
    if (hasBooted) {
      setBooting(false);
      setVisible(false);
      return;
    }

    const bootMessages = [
      "INITIALIZING WDS MAINFRAME...",
      "LOADING RETRO INTERFACE MODULES...",
      "ESTABLISHING SECURE CONNECTION...",
      "CALIBRATING CRT DISPLAY...",
      "MOUNTING FILE SYSTEM...",
      "SYSTEM READY."
    ];

    let currentLine = 0;
    
    const interval = setInterval(() => {
      if (currentLine < bootMessages.length) {
        setLines(prev => [...prev, bootMessages[currentLine]]);
        currentLine++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setBooting(false);
          sessionStorage.setItem('wds_booted', 'true');
          setTimeout(() => setVisible(false), 500); // Wait for fade out
        }, 600);
      }
    }, 150);

    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-cyber-bg flex flex-col items-center justify-center font-mono transition-opacity duration-500 ease-in-out ${
        booting ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="max-w-md w-full px-6 space-y-4">
        <div className="flex justify-center mb-8">
          <Terminal className="h-16 w-16 text-cyber-yellow animate-pulse" />
        </div>
        <div className="space-y-2 h-48">
          {lines.map((line, i) => (
            <div key={i} className="text-cyber-yellow text-sm font-bold tracking-wider opacity-90">
              <span className="mr-2 text-cyber-border">&gt;_</span>
              {line}
            </div>
          ))}
          {booting && lines.length < 6 && (
            <div className="text-cyber-yellow text-sm font-bold tracking-wider animate-pulse">
              <span className="mr-2 text-cyber-border">&gt;_</span>
              <span className="inline-block w-2 h-4 bg-cyber-yellow"></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
