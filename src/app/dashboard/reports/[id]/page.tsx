"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/Card';
import { TerminalButton } from '@/components/TerminalButton';
import { Loader2, ArrowLeft, Clock, Calendar, CheckSquare } from 'lucide-react';
import { BugReport } from '@/types';

export default function StudentReportDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [report, setReport] = useState<BugReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/bugs/${params.id}`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error(`Report ID ${params.id} not found.`);
          }
          throw new Error('Failed to retrieve report data.');
        }
        const data = await res.json();
        setReport(data);
      } catch (err: any) {
        setError(err.message || 'An error occurred loading the report details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 font-mono text-xs text-cyber-subtext space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-cyber-border" />
        <span>RECONSTRUCTING BUG METADATA...</span>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-md mx-auto py-12 space-y-4 font-mono text-xs">
        <div className="border border-cyber-red bg-cyber-red/10 p-4 text-cyber-red shadow-cyber-glow-red">
          {error || 'Report not found.'}
        </div>
        <Link href="/dashboard">
          <TerminalButton variant="primary" className="w-full py-4 min-h-[48px]">
            RETURN TO DASHBOARD
          </TerminalButton>
        </Link>
      </div>
    );
  }

  const statusColors = {
    'NEW': 'border-cyber-subtext text-cyber-subtext',
    'UNDER REVIEW': 'border-cyber-yellow text-cyber-yellow',
    'VALID': 'border-cyber-green text-cyber-green',
    'INVALID': 'border-cyber-red text-cyber-red opacity-65',
    'DUPLICATE': 'border-cyber-red text-cyber-red',
    'FIXED': 'border-cyber-green text-cyber-green text-glow-green',
    'VERIFIED': 'border-cyber-green text-cyber-green text-glow-green',
    'PRIORITIZED': 'border-cyber-yellow text-cyber-yellow',
    'IN PROGRESS': 'border-cyber-yellow text-cyber-yellow',
    'NEEDS MORE INFORMATION': 'border-cyber-yellow text-cyber-yellow',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-mono text-xs">
      
      {/* Header back navigation */}
      <div>
        <Link href="/dashboard" className="inline-flex items-center space-x-1.5 text-cyber-subtext hover:text-cyber-text transition-colors py-2 min-h-[44px]">
          <ArrowLeft className="h-4 w-4" />
          <span>BACK TO DASHBOARD</span>
        </Link>
      </div>

      {/* Main Details and Side Pane layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Report Content */}
        <div className="lg:col-span-8 space-y-6">
          <Card title={`${report.id} // REPORT_LOG`}>
            <div className="space-y-6 py-2">
              
              {/* Header Title / Page info */}
              <div className="border-b border-cyber-darkborder/30 pb-4">
                <span className="text-[10px] text-cyber-subtext uppercase">AFFECTED WEBPAGE</span>
                <h2 className="text-sm font-bold text-cyber-text tracking-wider uppercase mt-0.5">{report.pageCategory}</h2>
                <a 
                  href={report.pageUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-cyber-border hover:underline text-[10px] truncate block mt-1 break-all"
                >
                  {report.pageUrl}
                </a>
              </div>

              {/* Bug details text blocks */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-cyber-text font-bold uppercase">&gt; PROBLEM DESCRIPTION</span>
                  <p className="text-cyber-subtext whitespace-pre-wrap leading-relaxed bg-black/25 p-3 border border-cyber-darkborder/25">{report.description}</p>
                </div>
                
                <div className="space-y-1">
                  <span className="text-cyber-text font-bold uppercase">&gt; EXPECTED BEHAVIOUR</span>
                  <p className="text-cyber-subtext whitespace-pre-wrap leading-relaxed bg-black/25 p-3 border border-cyber-darkborder/25">{report.expectedBehaviour}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-cyber-text font-bold uppercase">&gt; ACTUAL BEHAVIOUR</span>
                  <p className="text-cyber-subtext whitespace-pre-wrap leading-relaxed bg-black/25 p-3 border border-cyber-darkborder/25">{report.actualBehaviour}</p>
                </div>


                {report.suggestedSolution && (
                  <div className="space-y-1">
                    <span className="text-cyber-text font-bold uppercase">&gt; SUGGESTED SOLUTION</span>
                    <p className="text-cyber-subtext whitespace-pre-wrap leading-relaxed bg-black/25 p-3 border border-cyber-darkborder/25">{report.suggestedSolution}</p>
                  </div>
                )}
              </div>

              {/* Uploaded screenshot */}
              {report.screenshotUrl && (
                <div className="space-y-2 pt-2 border-t border-cyber-darkborder/30">
                  <span className="text-cyber-text font-bold uppercase">&gt; SCREENSHOT EVIDENCE</span>
                  <div className="border border-cyber-darkborder p-2 bg-black/40 max-w-lg">
                    <img 
                      src={report.screenshotUrl} 
                      alt="Uploaded Screenshot Evidence" 
                      className="w-full max-h-96 object-contain border border-cyber-darkborder/50"
                    />
                  </div>
                </div>
              )}

            </div>
          </Card>
        </div>

        {/* Right Side: Sidebar Metadata */}
        <div className="lg:col-span-4 space-y-6">
          <Card title="REPORT_METADATA" headerControls={false}>
            <div className="space-y-6 py-2">
              
              {/* Status block */}
              <div className="space-y-1.5 border-b border-cyber-darkborder/30 pb-4 text-center">
                <span className="text-[10px] text-cyber-subtext uppercase block">CURRENT STATUS</span>
                <span className={`inline-block px-4 py-1 border text-sm uppercase font-bold text-glow tracking-widest ${statusColors[report.status] || 'border-cyber-border text-cyber-text'}`}>
                  {report.status}
                </span>
              </div>

              {/* Key Value Details */}
              <div className="space-y-3 font-mono">
                <div className="flex justify-between border-b border-cyber-darkborder/20 pb-2">
                  <span className="text-cyber-subtext uppercase">AWARDED POINTS:</span>
                  <span className="text-cyber-green font-bold text-glow-green">
                    {report.points > 0 ? `+${report.points} PTS` : '0 PTS'}
                  </span>
                </div>
                
                <div className="flex justify-between border-b border-cyber-darkborder/20 pb-2">
                  <span className="text-cyber-subtext uppercase">EST. SEVERITY:</span>
                  <span className="text-cyber-text uppercase">{report.studentSeverity || 'N/A'}</span>
                </div>

                {report.officialSeverity && (
                  <div className="flex justify-between border-b border-cyber-darkborder/20 pb-2">
                    <span className="text-cyber-subtext uppercase">OFFICIAL SEVERITY:</span>
                    <span className="text-cyber-yellow font-bold uppercase">{report.officialSeverity}</span>
                  </div>
                )}

                <div className="flex justify-between border-b border-cyber-darkborder/20 pb-2">
                  <span className="text-cyber-subtext uppercase">FIRST REPORT?</span>
                  <span className="text-cyber-text font-bold">{report.firstReport ? 'YES' : 'NO'}</span>
                </div>

                <div className="flex justify-between border-b border-cyber-darkborder/20 pb-2">
                  <span className="text-cyber-subtext uppercase">FIXED?</span>
                  <span className={`font-bold ${report.fixed ? 'text-cyber-green' : 'text-cyber-subtext'}`}>
                    {report.fixed ? 'YES (VERIFIED)' : 'NO (PENDING)'}
                  </span>
                </div>
              </div>

              {/* Time logs */}
              <div className="space-y-3 border-t border-cyber-darkborder/30 pt-4 text-[10px] text-cyber-subtext">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-cyber-border" />
                  <span>SUBMITTED: {new Date(report.submittedAt).toLocaleString()}</span>
                </div>
                {report.reviewedAt && (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-cyber-green" />
                    <span>REVIEWED: {new Date(report.reviewedAt).toLocaleString()}</span>
                  </div>
                )}
              </div>

            </div>
          </Card>
        </div>

      </div>

    </div>
  );
}
