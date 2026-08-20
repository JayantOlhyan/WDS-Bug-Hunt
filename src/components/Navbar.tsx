"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Monitor } from 'lucide-react';
import { TerminalButton } from './TerminalButton';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Handle escape key to close menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navLinks = [
    { name: 'HOME', href: '/bug-hunt' },
    { name: 'HOW IT WORKS', href: '/bug-hunt/how-it-works' },
    { name: 'LEADERBOARD', href: '/bug-hunt/leaderboard' },
    { name: 'RULES', href: '/bug-hunt/rules' },
    { name: 'DASHBOARD', href: '/dashboard' },
  ];

  return (
    <nav className="border-b-2 border-cyber-border bg-cyber-bg relative z-50">
      {/* Decorative cyber grid indicator line */}
      <div className="h-1 bg-cyber-border shadow-cyber-glow"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo / Society Branding */}
          <div className="flex items-center">
            <Link href="/bug-hunt" className="flex items-center space-x-2 text-cyber-text hover:opacity-80">
              <Image src="/logo.png" alt="WDS Logo" width={32} height={32} className="object-contain" />
              <span className="font-mono text-xs sm:text-sm font-extrabold uppercase tracking-widest text-glow">
                WEB DEV SOCIETY MSIT_
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`font-mono text-xs font-bold tracking-widest uppercase transition-colors hover:text-cyber-text ${
                    isActive ? 'text-cyber-text text-glow underline decoration-cyber-border decoration-2 underline-offset-4' : 'text-cyber-subtext'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            
            <Link href="/bug-hunt/report">
              <TerminalButton variant="primary" className="text-xs">
                REPORT A BUG
              </TerminalButton>
            </Link>
          </div>

          {/* Mobile hamburger menu trigger */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 text-cyber-subtext hover:text-cyber-text focus:outline-none min-h-[48px] min-w-[48px]"
              aria-expanded={isOpen}
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer (cyberpunk style overlay) */}
      {isOpen && (
        <div className="md:hidden border-t border-cyber-darkborder bg-cyber-card p-4 space-y-4 shadow-cyber-glow-strong">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`block w-full font-mono text-sm font-bold tracking-widest uppercase py-4 border-b border-dashed border-cyber-darkborder hover:text-cyber-text ${
                    isActive ? 'text-cyber-text text-glow' : 'text-cyber-subtext'
                  }`}
                >
                  &gt; {link.name}
                </Link>
              );
            })}
            <Link href="/bug-hunt/report" onClick={() => setIsOpen(false)} className="pt-2">
              <TerminalButton variant="primary" className="w-full text-xs">
                REPORT A BUG
              </TerminalButton>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
