"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/Card';
import { TerminalButton } from '@/components/TerminalButton';
import { 
  Search, 
  FileText, 
  Trophy, 
  Star, 
  Link as LinkIcon, 
  Maximize2, 
  AlertTriangle, 
  Smartphone, 
  Clock, 
  Code, 
  ChevronRight, 
  ArrowRight,
  Monitor
} from 'lucide-react';
import { Student } from '@/types';

// Retro Pixel Art Avatars in SVG
const PixelAvatar = ({ type }: { type: number }) => {
  const avatars = [
    // Avatar 1: Brown hair boy
    <svg key="1" viewBox="0 0 10 10" className="w-12 h-12" style={{ imageRendering: 'pixelated' }}>
      {/* Face background */}
      <rect x="2" y="3" width="6" height="5" fill="#fcd34d" />
      {/* Hair */}
      <rect x="2" y="2" width="6" height="1" fill="#78350f" />
      <rect x="3" y="1" width="4" height="1" fill="#78350f" />
      <rect x="2" y="3" width="1" height="2" fill="#78350f" />
      <rect x="7" y="3" width="1" height="2" fill="#78350f" />
      {/* Eyes */}
      <rect x="3" y="4" width="1" height="1" fill="#000" />
      <rect x="6" y="4" width="1" height="1" fill="#000" />
      {/* Mouth */}
      <rect x="4" y="6" width="2" height="1" fill="#b91c1c" />
      {/* Shirt */}
      <rect x="3" y="8" width="4" height="2" fill="#1d4ed8" />
    </svg>,
    
    // Avatar 2: Orange hair girl
    <svg key="2" viewBox="0 0 10 10" className="w-12 h-12" style={{ imageRendering: 'pixelated' }}>
      <rect x="2" y="3" width="6" height="5" fill="#fde047" />
      <rect x="1" y="2" width="8" height="2" fill="#ea580c" />
      <rect x="2" y="1" width="6" height="1" fill="#ea580c" />
      <rect x="1" y="4" width="1" height="3" fill="#ea580c" />
      <rect x="8" y="4" width="1" height="3" fill="#ea580c" />
      <rect x="3" y="5" width="1" height="1" fill="#000" />
      <rect x="6" y="5" width="1" height="1" fill="#000" />
      <rect x="4" y="7" width="2" height="1" fill="#be123c" />
      <rect x="3" y="8" width="4" height="2" fill="#047857" />
    </svg>,

    // Avatar 3: Black hair boy with green shirt
    <svg key="3" viewBox="0 0 10 10" className="w-12 h-12" style={{ imageRendering: 'pixelated' }}>
      <rect x="2" y="3" width="6" height="5" fill="#fed7aa" />
      <rect x="2" y="2" width="6" height="1" fill="#1c1917" />
      <rect x="3" y="1" width="4" height="1" fill="#1c1917" />
      <rect x="2" y="3" width="1" height="2" fill="#1c1917" />
      <rect x="7" y="3" width="1" height="2" fill="#1c1917" />
      <rect x="3" y="4" width="1" height="1" fill="#000" />
      <rect x="6" y="4" width="1" height="1" fill="#000" />
      <rect x="4" y="6" width="2" height="1" fill="#991b1b" />
      <rect x="3" y="8" width="4" height="2" fill="#15803d" />
    </svg>,

    // Avatar 4: Purple hair girl
    <svg key="4" viewBox="0 0 10 10" className="w-12 h-12" style={{ imageRendering: 'pixelated' }}>
      <rect x="2" y="3" width="6" height="5" fill="#fbcfe8" />
      <rect x="2" y="1" width="6" height="2" fill="#7c3aed" />
      <rect x="1" y="3" width="1" height="4" fill="#7c3aed" />
      <rect x="8" y="3" width="1" height="4" fill="#7c3aed" />
      <rect x="3" y="4" width="1" height="1" fill="#000" />
      <rect x="6" y="4" width="1" height="1" fill="#000" />
      <rect x="4" y="6" width="2" height="1" fill="#be123c" />
      <rect x="3" y="8" width="4" height="2" fill="#a21caf" />
    </svg>,

    // Avatar 5: Cap boy
    <svg key="5" viewBox="0 0 10 10" className="w-12 h-12" style={{ imageRendering: 'pixelated' }}>
      <rect x="2" y="3" width="6" height="5" fill="#f59e0b" />
      {/* Cap */}
      <rect x="2" y="1" width="6" height="2" fill="#b91c1c" />
      <rect x="1" y="2" width="8" height="1" fill="#b91c1c" />
      <rect x="3" y="4" width="1" height="1" fill="#000" />
      <rect x="6" y="4" width="1" height="1" fill="#000" />
      <rect x="4" y="6" width="2" height="1" fill="#7f1d1d" />
      <rect x="3" y="8" width="4" height="2" fill="#4338ca" />
    </svg>
  ];
  return avatars[type] || avatars[0];
};

export default function BugHuntLanding() {
  const [topHunters, setTopHunters] = useState<Student[]>([]);
  const [loadingTop, setLoadingTop] = useState(true);

  useEffect(() => {
    const fetchTop = async () => {
      try {
        const res = await fetch('/api/leaderboard');
        if (res.ok) {
          const data = await res.json();
          setTopHunters(data.slice(0, 5)); // We need top 5 for the avatar grid layout
        }
      } catch (err) {
        console.error("Failed to load top hunters", err);
      } finally {
        setLoadingTop(false);
      }
    };
    fetchTop();
  }, []);

  const formatStudentName = (fullName: string) => {
    if (!fullName) return '';
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) return parts[0];
    const firstName = parts[0];
    const lastInitial = parts[parts.length - 1].charAt(0);
    return `${firstName} ${lastInitial}.`;
  };

  return (
    <div className="space-y-10 font-mono text-xs text-cyber-text">
      
      {/* SECTION 1: HERO & CORE ENTRY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
        
        {/* Left Hero Content */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block px-3 py-1 border border-cyber-darkborder bg-black text-[10px] uppercase font-bold tracking-widest text-cyber-text">
            &gt;_ MSIT WEBSITE BUG HUNT
          </div>

          <h1 className="text-[clamp(42px,12vw,60px)] font-mono font-black uppercase tracking-tight text-cyber-text leading-none select-none text-glow">
            FIND IT.<br/>
            REPORT IT.<br/>
            GET RECOGNIZED.
          </h1>

          <p className="font-mono text-sm text-cyber-subtext max-w-lg leading-relaxed">
            Find real issues on the MSIT website. Report them with proof. Earn points. Get recognized by WDS.
          </p>

          <a href="https://msit-website.netlify.app/" target="_blank" rel="noopener noreferrer" className="block max-w-lg border border-cyber-border bg-cyber-darkborder/20 p-4 font-mono text-sm text-cyber-text hover:bg-cyber-darkborder/40 transition-colors shadow-cyber-glow">
            <div className="flex items-center space-x-2">
              <LinkIcon className="w-4 h-4 text-cyber-yellow" />
              <span className="font-bold uppercase tracking-wider text-cyber-yellow">Target Website:</span>
            </div>
            <p className="mt-1 text-cyber-subtext break-all">https://msit-website.netlify.app/</p>
          </a>

          <div className="flex flex-col md:flex-row gap-4 items-center w-full">
            <Link href="/bug-hunt/report" className="w-full md:w-auto">
              <button className="w-full md:w-auto bg-cyber-border border-2 border-cyber-border text-black font-mono font-bold uppercase tracking-wider text-xs py-4 px-6 shadow-cyber-glow flex items-center justify-center space-x-1.5 transition-all active:translate-y-0.5 hover:bg-transparent hover:text-cyber-text">
                <span>&gt;_ REPORT A BUG</span>
              </button>
            </Link>
            <Link href="/bug-hunt/leaderboard" className="w-full md:w-auto">
              <button className="w-full md:w-auto bg-transparent border-2 border-cyber-border text-cyber-text font-mono font-bold uppercase tracking-wider text-xs py-4 px-6 flex items-center justify-center transition-all active:translate-y-0.5 hover:bg-cyber-border hover:text-black">
                <span>&gt;_ VIEW LEADERBOARD</span>
              </button>
            </Link>
          </div>

          {/* Quick stats row matching layout */}
          <div className="flex flex-wrap gap-6 pt-2 text-[10px] text-cyber-subtext border-t border-cyber-darkborder/30 max-w-md">
            <div className="flex items-center space-x-1.5">
              <Clock className="h-4.5 w-4.5 text-cyber-border" />
              <span>Takes ~2 minutes</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Code className="h-4.5 w-4.5 text-cyber-border" />
              <span>No coding required</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Trophy className="h-4.5 w-4.5 text-cyber-border" />
              <span>Real recognition</span>
            </div>
          </div>
        </div>

        {/* Right Hero Status Widget */}
        <div className="lg:col-span-5">
          <div className="bg-cyber-card border-2 border-cyber-border shadow-cyber-glow relative flex flex-col">
            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 text-cyber-border font-bold select-nonepointer-events-none">+</div>
            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 text-cyber-border font-bold select-none pointer-events-none">+</div>
            <div className="absolute -bottom-2 -left-1.5 w-3 h-3 text-cyber-border font-bold select-none pointer-events-none">+</div>
            <div className="absolute -bottom-2 -right-1.5 w-3 h-3 text-cyber-border font-bold select-none pointer-events-none">+</div>
            
            {/* Widget header */}
            <div className="flex items-center justify-between border-b border-cyber-darkborder bg-cyber-bg px-3 py-2 select-none">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyber-text text-glow">
                &gt;_ BUG_HUNT_STATUS
              </span>
              <div className="flex space-x-1.5 text-cyber-subtext text-[10px] font-mono">
                <span>[—]</span>
                <span>[▢]</span>
                <span>[X]</span>
              </div>
            </div>

            {/* Widget Content */}
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-cyber-subtext uppercase">STATUS:</span>
                <span className="text-cyber-green font-bold flex items-center space-x-1 text-glow-green">
                  <span>●</span> <span>ACTIVE</span>
                </span>
              </div>
              
              <div className="border-b border-dashed border-cyber-darkborder/50"></div>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-cyber-subtext flex items-center space-x-1.5">
                    <span>👾</span> <span>BUGS FOUND</span>
                  </span>
                  <span className="font-bold text-cyber-text">305+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyber-subtext flex items-center space-x-1.5">
                    <span>🪙</span> <span>POINTS DISTRIBUTED</span>
                  </span>
                  <span className="font-bold text-cyber-text">2,850 PTS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyber-subtext flex items-center space-x-1.5">
                    <span>👤</span> <span>ACTIVE HUNTERS</span>
                  </span>
                  <span className="font-bold text-cyber-text">64 MEMBERS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyber-subtext flex items-center space-x-1.5">
                    <span>🎓</span> <span>ORIENTATIONS</span>
                  </span>
                  <span className="font-bold text-cyber-text">5 COMPLETED</span>
                </div>
              </div>

              {/* Cursor Box */}
              <div className="border border-cyber-darkborder bg-black/45 p-3 font-mono text-[11px] leading-relaxed text-cyber-subtext">
                <span className="text-cyber-text font-bold block mb-1">&gt;_</span>
                <span>One society.</span><br/>
                <span>Countless possibilities.</span><br/>
                <span className="text-cyber-text">Be part of it.</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 2: HOW IT WORKS */}
      <div className="space-y-4 pt-4 border-t border-cyber-darkborder/25">
        <div className="flex justify-between items-center pb-2">
          <span className="text-sm font-bold uppercase tracking-widest text-cyber-text text-glow">
            &gt;_ HOW IT WORKS
          </span>
          <span className="text-[10px] text-cyber-subtext uppercase font-bold tracking-widest">
            [4 EASY STEPS]
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
          {[
            { step: '01', title: 'FIND', icon: Search, desc: 'Explore the MSIT website and look for something broken, missing or incorrect.' },
            { step: '02', title: 'REPORT', icon: FileText, desc: 'Submit the issue with its URL, explanation and screenshot.' },
            { step: '03', title: 'EARN', icon: Trophy, desc: 'Valid bugs earn points based on severity and report quality.' },
            { step: '04', title: 'RISE', icon: Star, desc: 'Climb the leaderboard and earn WDS badges and recognition.' }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <React.Fragment key={idx}>
                <div className="relative">
                  <Card title={`STEP_${item.step}`} headerControls={false} className="h-full border-cyber-darkborder/50">
                    <div className="space-y-3 py-1 font-mono">
                      <span className="text-xs font-bold text-cyber-subtext bg-black border border-cyber-darkborder/40 p-1 px-1.5 inline-block">
                        {item.step}
                      </span>
                      <Icon className="h-8 w-8 text-cyber-border mx-auto animate-pulse" />
                      <span className="font-bold text-cyber-text uppercase tracking-widest block text-center text-xs text-glow">
                        {item.title}
                      </span>
                      <p className="text-[10px] text-cyber-subtext leading-relaxed text-center min-h-[44px]">
                        {item.desc}
                      </p>
                    </div>
                  </Card>
                  {/* Divider arrow on desktop */}
                  {idx < 3 && (
                    <span className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-cyber-border font-bold text-sm z-20">
                      &gt;
                    </span>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* SECTION 3 & 4: WHAT CAN YOU FIND & SCORING SYSTEM (SIDE-BY-SIDE) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-cyber-darkborder/25">
        
        {/* WHAT CAN YOU FIND? */}
        <Card title="WHAT CAN YOU FIND?">
          <div className="space-y-4 py-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-center">
              {[
                { title: 'BROKEN', icon: LinkIcon, sub: 'Links, buttons, forms, navigation' },
                { title: 'MISSING', icon: Maximize2, sub: 'Content, images, pages, sections' },
                { title: 'WRONG', icon: AlertTriangle, sub: 'Incorrect text, data, information' },
                { title: 'MOBILE', icon: Smartphone, sub: 'Layout issues, responsiveness' }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="space-y-2 border border-cyber-darkborder/25 p-2 bg-black/25">
                    <Icon className="h-6 w-6 text-cyber-border mx-auto" />
                    <span className="font-bold text-cyber-text text-[9px] uppercase tracking-wider block">{item.title}</span>
                    <p className="text-[8px] text-cyber-subtext uppercase leading-tight scale-90">{item.sub}</p>
                  </div>
                );
              })}
            </div>
            
            <div className="border border-cyber-darkborder/30 bg-black/40 p-3 font-mono text-[10px] flex justify-between items-center">
              <div className="space-y-0.5">
                <span className="text-cyber-subtext uppercase block text-[9px]">EXAMPLE:</span>
                <span className="text-cyber-text">Faculty page → LinkedIn button → 404 error</span>
              </div>
              <span className="border border-dotted border-cyber-border px-2 py-0.5 text-cyber-text text-[9px] font-bold uppercase select-none">
                That&apos;s a bug!
              </span>
            </div>
          </div>
        </Card>

        {/* SCORING SYSTEM */}
        <Card title="SCORING SYSTEM">
          <div className="space-y-4 py-1">
            <div className="space-y-2">
              {[
                { name: 'MINOR', pts: '2 - 5 pts', border: 'border-cyber-green text-cyber-green', desc: 'Typos, minor UI, alignment issues' },
                { name: 'MODERATE', pts: '10 - 15 pts', border: 'border-cyber-border text-cyber-text', desc: 'Broken links, missing info, wrong content' },
                { name: 'MAJOR', pts: '20 - 30 pts', border: 'border-cyber-yellow text-cyber-yellow', desc: 'Major functionality or page issues' },
                { name: 'CRITICAL', pts: '50+ pts', border: 'border-cyber-red text-cyber-red', desc: 'Severe issues affecting users' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-cyber-darkborder/20 pb-1.5 last:border-0 last:pb-0">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 border text-[9px] font-bold uppercase select-none ${item.border}`}>
                      {item.name}
                    </span>
                    <span className="text-[10px] text-cyber-subtext break-words w-full">{item.desc}</span>
                  </div>
                  <span className="font-bold text-cyber-text whitespace-nowrap pl-2">{item.pts}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-cyber-darkborder/30 pt-3 flex flex-wrap gap-4 text-[9px] text-cyber-subtext justify-between">
              <span className="flex items-center space-x-1"><span>+5 pts</span> <span className="uppercase">Clear reproduction steps</span></span>
              <span className="flex items-center space-x-1"><span>+5 pts</span> <span className="uppercase">Useful suggested solution</span></span>
            </div>

            <div className="text-center pt-2">
              <Link href="/bug-hunt/scoring" className="text-cyber-text underline hover:opacity-85 uppercase font-bold text-[9px] tracking-widest block text-glow">
                VIEW FULL SCORING →
              </Link>
            </div>
          </div>
        </Card>

      </div>

      {/* SECTION 5: TOP BUG HUNTERS */}
      <div className="space-y-4 pt-4 border-t border-cyber-darkborder/25">
        <div className="flex justify-between items-center pb-2">
          <span className="text-sm font-bold uppercase tracking-widest text-cyber-text text-glow">
            &gt;_ TOP BUG HUNTERS
          </span>
          <Link href="/bug-hunt/leaderboard" className="text-[10px] text-cyber-subtext hover:text-cyber-text uppercase font-bold tracking-widest">
            VIEW FULL LEADERBOARD →
          </Link>
        </div>

        <Card title="LEADERBOARD_PREVIEW" headerControls={false}>
          <div className="py-2">
            {loadingTop ? (
              <div className="text-center py-6 text-cyber-subtext animate-pulse">
                DECRYPTING STANDINGS DATA...
              </div>
            ) : topHunters.length === 0 ? (
              <div className="text-center py-6 text-cyber-subtext">
                NO STANDINGS LOGGED. START HUNTING!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {topHunters.map((hunter, idx) => (
                  <div key={hunter.mobileNumber} className="border border-cyber-darkborder/40 p-3 bg-black/40 text-center relative flex flex-col items-center">
                    <span className="absolute top-1 left-1 border border-cyber-darkborder bg-black text-[9px] font-bold p-0.5 px-1 inline-block">
                      {idx + 1}
                    </span>
                    
                    <div className="mt-2 mb-3">
                      <PixelAvatar type={idx} />
                    </div>

                    <span className="font-bold text-cyber-text uppercase text-[10px] tracking-wider block truncate w-full">
                      {formatStudentName(hunter.name)}
                    </span>
                    
                    <div className="mt-2 border border-cyber-border bg-cyber-border/5 text-[9px] text-cyber-text font-bold p-1 px-2 select-none shadow-[0_0_5px_rgba(245,158,11,0.1)]">
                      {hunter.totalPoints} PTS
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* SECTION 6: PERSISTENT BOTTOM CTA */}
      <div className="border border-cyber-border p-4 bg-cyber-card relative">
        <div className="absolute -top-1.5 -left-1.5 w-3 h-3 text-cyber-border font-bold select-none pointer-events-none">+</div>
        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 text-cyber-border font-bold select-none pointer-events-none">+</div>
        <div className="absolute -bottom-2 -left-1.5 w-3 h-3 text-cyber-border font-bold select-none pointer-events-none">+</div>
        <div className="absolute -bottom-2 -right-1.5 w-3 h-3 text-cyber-border font-bold select-none pointer-events-none">+</div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-2">
          <div className="flex items-center space-x-4">
            {/* Beetle / Bug with magnifying glass SVG icon */}
            <svg viewBox="0 0 24 24" className="h-10 w-10 text-cyber-border flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              <circle cx="12" cy="12" r="6" fill="#f59e0b" fillOpacity="0.1" />
              <circle cx="15" cy="15" r="4" stroke="#f59e0b" fill="#000" />
              <path d="M18 18l3.5 3.5" />
            </svg>
            <div className="space-y-0.5">
              <span className="font-bold text-cyber-text uppercase text-sm tracking-wider block text-glow">
                READY TO HUNT?
              </span>
              <p className="text-[10px] text-cyber-subtext uppercase tracking-widest leading-relaxed">
                The MSIT website is full of hidden bugs. Find them. Report them. Get rewarded.
              </p>
            </div>
          </div>

          <div>
            <Link href="/bug-hunt/report" className="inline-block w-full">
              <button className="w-full bg-cyber-border border-2 border-cyber-border text-black font-mono font-bold uppercase tracking-wider text-xs py-4 px-6 shadow-cyber-glow transition-all active:translate-y-0.5 hover:bg-transparent hover:text-cyber-text">
                <span>&gt;_ REPORT A BUG NOW</span>
              </button>
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
