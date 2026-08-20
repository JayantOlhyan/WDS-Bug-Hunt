import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/Card';
import { TerminalButton } from '@/components/TerminalButton';
import { ArrowLeft, BookOpen, AlertTriangle, Smartphone, HelpCircle } from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 font-mono text-xs">
      
      {/* Back button */}
      <div>
        <Link href="/bug-hunt" className="inline-flex items-center space-x-1.5 text-cyber-subtext hover:text-cyber-text transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>BACK TO HOME</span>
        </Link>
      </div>

      <div className="space-y-2 border-b border-cyber-darkborder pb-4">
        <h1 className="text-2xl sm:text-3xl font-mono font-bold uppercase text-cyber-text tracking-widest text-glow">
          &gt;_ HOW_IT_WORKS
        </h1>
        <p className="text-xs sm:text-sm text-cyber-subtext">
          A guide for orientation participants: how to hunt bugs, write reports, and win rewards.
        </p>
      </div>

      {/* No coding required callout banner */}
      <div className="border border-cyber-border bg-cyber-card p-4 font-mono text-xs shadow-cyber-glow">
        <span className="font-bold text-cyber-text uppercase text-glow block">⚡ NO CODING SKILLS REQUIRED!</span>
        <p className="text-cyber-subtext mt-1 leading-relaxed">
          Many freshers think this challenge is only for programmers. **It is not.** You don&apos;t need to write code to participate — you just need a sharp eye. If you can browse the internet and notice when an image is broken, a button does nothing, or layout text overlaps, you can successfully win this challenge!
        </p>
      </div>

      {/* Four core steps */}
      <div className="space-y-4">
        <span className="text-cyber-text font-bold uppercase tracking-wider block">&gt; CORE STEPS</span>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { step: '01', title: 'FIND BUGS', desc: 'Browse the MSIT website and hunt for broken parts, spelling errors, or layout issues.' },
            { step: '02', title: 'REPORT IT', desc: 'Submit a report with the page URL, screenshots, and simple explanation.' },
            { step: '03', title: 'EARN POINTS', desc: 'WDS Reviewers validate your report and award points based on severity.' },
            { step: '04', title: 'GET BADGES', desc: 'Climb the standings leaderboard and win technical society badges.' }
          ].map((item, idx) => (
            <Card key={idx} title={`STEP_${item.step}`} headerControls={false}>
              <div className="space-y-1.5 py-1">
                <span className="text-2xl font-black text-cyber-border/30 block">{item.step}</span>
                <span className="font-bold text-cyber-text uppercase tracking-widest block">{item.title}</span>
                <p className="text-cyber-subtext leading-relaxed text-[11px]">{item.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* What counts as a bug */}
      <div className="space-y-4">
        <span className="text-cyber-text font-bold uppercase tracking-wider block">&gt; WHAT CAN YOU FIND?</span>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { name: 'BROKEN STUFF', icon: AlertTriangle, desc: 'Links that return 404, buttons that do not respond when clicked, forms that fail when submitting.' },
            { name: 'MISSING CONTENT', icon: BookOpen, desc: 'Faculty images not loading, missing notice PDFs, empty event details screens.' },
            { name: 'INCORRECT DATA', icon: HelpCircle, desc: 'Wrong office email, outdated contact numbers, typos in faculty lists, incorrect dates.' },
            { name: 'MOBILE LAYOUTS', icon: Smartphone, desc: 'Text overlapping images on phones, grids breaking, menus cut off, unresponsive containers.' }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card key={idx} title={item.name} headerControls={false}>
                <div className="flex space-x-3 py-1 items-start">
                  <div className="border border-cyber-border p-2 bg-black/40 text-cyber-text flex-shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <span className="font-bold text-cyber-text tracking-wider uppercase block">{item.name}</span>
                    <p className="text-cyber-subtext leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Bug examples */}
      <Card title="REAL-WORLD_BUG_EXAMPLES">
        <div className="space-y-4 py-2 font-mono text-xs">
          <p className="text-cyber-subtext">Here are real issues reported in previous orientation runs to guide your search:</p>
          
          <div className="space-y-3 pl-2">
            {[
              { bug: "Faculty profile → LinkedIn icon → clicking redirects to a 404 page.", type: "BROKEN LINK" },
              { bug: "Syllabus download link → clicking opens Google Drive with 'Access Denied' permissions.", type: "MISSING PERMISSION" },
              { bug: "About page → Vision & Mission block → text overflows the background boundary on mobile screens.", type: "MOBILE LAYOUT" },
              { bug: "Contact page form → email field accepts inputs like 'hello' without showing validations.", type: "INPUT VALIDATION" }
            ].map((ex, idx) => (
              <div key={idx} className="border-l-2 border-cyber-border pl-3 py-1 hover:bg-white/5 transition-colors">
                <span className="text-cyber-yellow font-bold uppercase text-[10px] tracking-widest">{ex.type}</span>
                <p className="text-cyber-text mt-0.5">{ex.bug}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="flex justify-center pt-2">
        <Link href="/bug-hunt/report">
          <TerminalButton variant="primary" className="px-8 py-3 text-sm">
            START HUNTING NOW &gt;
          </TerminalButton>
        </Link>
      </div>

    </div>
  );
}
