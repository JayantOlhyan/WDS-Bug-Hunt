import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/Card';
import { TerminalButton } from '@/components/TerminalButton';
import { Award, ArrowLeft, ShieldAlert } from 'lucide-react';

export default function ScoringPage() {
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
          &gt;_ SCORING_ARCHITECTURE
        </h1>
        <p className="text-xs sm:text-sm text-cyber-subtext">
          How points and bonuses are calculated by WDS reviewers.
        </p>
      </div>

      <Card title="SCORING_MATRIX">
        <div className="space-y-6 py-2">
          <p className="text-cyber-subtext leading-relaxed">
            Every submission is reviewed by the WDS team. Valid contributions receive points based on severity and quality:
          </p>

          <div className="border border-cyber-darkborder">
            <div className="grid grid-cols-3 bg-cyber-card border-b border-cyber-darkborder p-3 font-bold text-cyber-text">
              <span>BUG CLASSIFICATION</span>
              <span>SEVERITY</span>
              <span>BASE SCORE</span>
            </div>
            
            {[
              { type: 'Typographical Errors / Text Misalignments', sev: 'MINOR', pts: '2 points', desc: 'Spelling mistakes, font inconsistencies, minor spacing issues.' },
              { type: 'Small UI/UX Flaws / Contrast Issues', sev: 'MINOR', pts: '5 points', desc: 'Bad color contrast, overlaps, elements cut off on screen.' },
              { type: 'Broken Redirects / Broken Links', sev: 'MODERATE', pts: '10 points', desc: 'Clicking a link goes to a 404 page or doesn\'t direct properly.' },
              { type: 'Missing Information / Bad Faculty Profiles', sev: 'MODERATE', pts: '10 points', desc: 'Wrong office address, missing emails, outdated notices.' },
              { type: 'Broken Interactive Components', sev: 'MODERATE', pts: '20 points', desc: 'Dropdowns not opening, filters failing, search failing.' },
              { type: 'Major Navigation Failures / Access Errors', sev: 'MAJOR', pts: '30 points', desc: 'Global menu doesn\'t open, critical pages return HTTP 500.' },
              { type: 'Security Flaws / Workflows Broken', sev: 'CRITICAL', pts: '50+ points', desc: 'Data leaks, SQL injection pathways, login bypasses.' }
            ].map((row, idx) => (
              <div key={idx} className="grid grid-cols-3 p-3 border-b border-cyber-darkborder/50 text-cyber-subtext hover:text-cyber-text hover:bg-white/5 transition-colors">
                <div>
                  <span className="font-bold block text-cyber-text">{row.type}</span>
                  <span className="text-[10px] mt-0.5 block opacity-85">{row.desc}</span>
                </div>
                <span className="text-cyber-yellow font-semibold">{row.sev}</span>
                <span className="text-cyber-green font-bold">{row.pts}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="QUALITY_BONUS_MODIFIERS">
          <div className="space-y-4 py-2">
            <p className="text-cyber-subtext">You can increase your report score by providing high-quality descriptions and reproduction details:</p>
            
            <div className="space-y-3">
              {[
                { name: 'Clear reproduction steps', bonus: '+5 PTS', desc: 'Providing clear, numbered steps to easily trigger the bug.' },
                { name: 'Suggested practical fix code', bonus: '+5 PTS', desc: 'Proposing actual HTML/CSS/JS fixes for developers.' },
                { name: 'High-resolution screenshot evidence', bonus: '+3 PTS', desc: 'Sharp screenshots clearly pointing out the misalignment.' },
                { name: 'First discoverer reporting bonus', bonus: '+10 PTS', desc: 'Being the very first student to report a verified bug.' }
              ].map((bonus, idx) => (
                <div key={idx} className="flex justify-between items-start border-b border-cyber-darkborder/25 pb-2">
                  <div>
                    <span className="font-bold text-cyber-text uppercase">{bonus.name}</span>
                    <p className="text-[10px] text-cyber-subtext mt-0.5">{bonus.desc}</p>
                  </div>
                  <span className="text-cyber-green font-bold text-glow-green text-sm">{bonus.bonus}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card title="DUPLICATE_SCORING_RULES">
          <div className="space-y-4 py-2">
            <p className="text-cyber-subtext">MSIT orientations have many concurrent hunters. If multiple reports target the exact same issue:</p>
            
            <div className="space-y-3">
              <div>
                <span className="text-cyber-green font-bold uppercase block">First report log:</span>
                <p className="text-cyber-subtext mt-1">Receives full base points + quality bonuses for the discovery.</p>
              </div>
              
              <div>
                <span className="text-cyber-red font-bold uppercase block">Later duplicate logs:</span>
                <p className="text-cyber-subtext mt-1">Assigned duplicate status. 0 points are awarded to prevent spamming, but logs remain stored in the student profile details for recruitment analytics.</p>
              </div>
            </div>

            <div className="border border-cyber-darkborder bg-black/40 p-3 border-dashed flex items-center space-x-3">
              <ShieldAlert className="h-5 w-5 text-cyber-yellow animate-pulse flex-shrink-0" />
              <p className="text-[10px] text-cyber-subtext">
                WDS reviewer decisions on validation statuses, duplicate markers, and point assignments are final.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-center pt-4">
        <Link href="/bug-hunt/report">
          <TerminalButton variant="primary" className="px-8 py-3 text-sm">
            REPORT A BUG NOW &gt;
          </TerminalButton>
        </Link>
      </div>

    </div>
  );
}
