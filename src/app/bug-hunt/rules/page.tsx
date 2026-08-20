import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/Card';
import { TerminalButton } from '@/components/TerminalButton';
import { ShieldAlert, ArrowLeft, CheckCircle2, AlertOctagon } from 'lucide-react';

export default function RulesPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 font-mono text-xs">
      
      {/* Back link */}
      <div>
        <Link href="/bug-hunt" className="inline-flex items-center space-x-1.5 text-cyber-subtext hover:text-cyber-text transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>BACK TO HOME</span>
        </Link>
      </div>

      <div className="space-y-2 border-b border-cyber-darkborder pb-4">
        <h1 className="text-2xl sm:text-3xl font-mono font-bold uppercase text-cyber-text tracking-widest text-glow">
          &gt;_ SECURITY_&amp;_QA_RULEBOOK
        </h1>
        <p className="text-xs sm:text-sm text-cyber-subtext">
          Code of conduct and allowed boundaries for MSIT Website QA Challenge.
        </p>
      </div>

      <div className="border border-cyber-red bg-cyber-red/10 p-4 flex items-center space-x-4 text-cyber-red shadow-cyber-glow-red">
        <ShieldAlert className="h-8 w-8 flex-shrink-0 animate-bounce" />
        <div>
          <span className="font-bold text-glow-red uppercase block">IMPORTANT SECURITY NOTICE</span>
          <p className="text-[10px] text-cyber-subtext mt-0.5 leading-relaxed">
            This is a user experience QA challenge, NOT a penetration test or permission for malicious cyber attacks. Violating these rules will result in immediate disqualification and reporting to college administration.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Permitted Activities */}
        <Card title="PERMITTED_QA_ACTIVITIES">
          <div className="space-y-4 py-2">
            <div className="flex items-center space-x-2 text-cyber-green">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-bold uppercase tracking-wider">ALLOWED BOUNDS</span>
            </div>
            
            <ul className="list-disc pl-4 space-y-3 text-cyber-subtext">
              <li>
                <span className="text-cyber-text font-bold uppercase">BROWSE PUBLIC PAGES:</span>
                <p className="mt-0.5">Explore standard menus, read faculty lists, check notices, admissions, and placement history screens.</p>
              </li>
              <li>
                <span className="text-cyber-text font-bold uppercase">MOBILE COMPATIBILITY:</span>
                <p className="mt-0.5">Check how the layout behaves on Android/iOS phones, inspect if text overflows or grids break.</p>
              </li>
              <li>
                <span className="text-cyber-text font-bold uppercase">LINK VALIDATIONS:</span>
                <p className="mt-0.5">Verify that links to notices, faculty profiles, and event registration forms redirect correctly.</p>
              </li>
              <li>
                <span className="text-cyber-text font-bold uppercase">FORM INTEGRITY:</span>
                <p className="mt-0.5">Test standard text inputs and verify if email validation checks work correctly.</p>
              </li>
            </ul>
          </div>
        </Card>

        {/* Prohibited Actions */}
        <Card title="PROHIBITED_MALICIOUS_ACTIONS">
          <div className="space-y-4 py-2">
            <div className="flex items-center space-x-2 text-cyber-red">
              <AlertOctagon className="h-5 w-5" />
              <span className="font-bold uppercase tracking-wider">PROHIBITED ACTIONS</span>
            </div>
            
            <ul className="list-disc pl-4 space-y-3 text-cyber-subtext">
              <li>
                <span className="text-cyber-red font-bold uppercase">NO PORT SCANNING:</span>
                <p className="mt-0.5">Do not attempt port scans or automated vulnerability scanning tools against MSIT servers.</p>
              </li>
              <li>
                <span className="text-cyber-red font-bold uppercase">NO DDOS ATTACKS:</span>
                <p className="mt-0.5">Do not perform rate-limiting tests, stress tests, or try to slow down the college website.</p>
              </li>
              <li>
                <span className="text-cyber-red font-bold uppercase">NO PAYLOAD INJECTIONS:</span>
                <p className="mt-0.5">Do not input SQL injection strings, XSS payloads, or execute malicious commands inside search bars.</p>
              </li>
              <li>
                <span className="text-cyber-red font-bold uppercase">NO AUTHENTICATION BYPASS:</span>
                <p className="mt-0.5">Do not attempt to access administrative sub-directories or brute-force credentials on faculty login pages.</p>
              </li>
            </ul>
          </div>
        </Card>

      </div>

      <Card title="RECRUITMENT_COMPLIANCE">
        <div className="space-y-2 py-1 leading-relaxed text-cyber-subtext">
          <p>
            The महाराजा सूरजमल संस्थान (MSIT) values technical competence, integrity, and ethical conduct. By participating in this Bug Hunt orientation activity, you agree to report any found issues privately through the official Web Dev Society reporting tool.
          </p>
          <p className="pt-2">
            Exposing vulnerabilities publicly (such as posting screenshots on social media before they are fixed) will immediately disqualify you from future WDS recruitment processes.
          </p>
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row justify-center pt-2 w-full">
        <Link href="/bug-hunt/report" className="w-full sm:w-auto">
          <TerminalButton variant="primary" className="w-full sm:w-auto px-8 py-4 text-sm flex justify-center">
            I AGREE - START HUNTING
          </TerminalButton>
        </Link>
      </div>

    </div>
  );
}
