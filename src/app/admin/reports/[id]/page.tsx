"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/Card';
import { TerminalButton } from '@/components/TerminalButton';
import { Loader2, ArrowLeft, Save, CheckCircle, Clock } from 'lucide-react';
import { BugReport } from '@/types';

export default function AdminReportReview({ params }: { params: { id: string } }) {
  const router = useRouter();
  
  // Auth validation
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  // Data states
  const [report, setReport] = useState<BugReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form updates
  const [form, setForm] = useState({
    status: '' as BugReport['status'],
    officialSeverity: '',
    points: 0,
    duplicate: false,
    firstReport: false,
    fixed: false,
    internalNotes: '',
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Validate admin access on mount
  useEffect(() => {
    const session = sessionStorage.getItem('msit_bughunt_admin');
    if (session !== 'true') {
      router.push('/admin');
    } else {
      setIsAdmin(true);
      setAuthChecking(false);
      fetchReport();
    }
  }, []);

  const fetchReport = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/bugs/${params.id}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(`Report ID ${params.id} not found.`);
        }
        throw new Error('Failed to load report.');
      }
      const data = await res.json();
      setReport(data);
      
      // Seed form
      setForm({
        status: data.status,
        officialSeverity: data.officialSeverity || data.studentSeverity || 'Minor',
        points: data.points || 0,
        duplicate: data.duplicate || false,
        firstReport: data.firstReport || false,
        fixed: data.fixed || false,
        internalNotes: data.internalNotes || '',
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred loading detail metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateSuccess(false);

    try {
      const res = await fetch(`/api/bugs/${params.id}`, {
        method: 'POST', // Use POST or PATCH to update
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Failed to update report database.');

      const data = await res.json();
      setReport(data);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Update failed.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (authChecking || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 font-mono text-xs text-cyber-subtext space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-cyber-border" />
        <span>RECONSTRUCTING BUG METADATA...</span>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-md mx-auto py-12 space-y-4 font-mono text-xs text-center">
        <div className="border border-cyber-red bg-cyber-red/10 p-4 text-cyber-red">
          {error || 'Record retrieval failure.'}
        </div>
        <Link href="/admin">
          <TerminalButton variant="primary" className="w-full">
            RETURN TO QUEUE
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
    <div className="max-w-6xl mx-auto space-y-6 font-mono text-xs">
      
      {/* Back button */}
      <div>
        <Link href="/admin" className="inline-flex items-center space-x-1.5 text-cyber-subtext hover:text-cyber-text transition-colors py-2 min-h-[44px]">
          <ArrowLeft className="h-4 w-4" />
          <span>BACK TO QUEUE</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left pane: Bug details */}
        <div className="lg:col-span-7 space-y-6">
          <Card title={`${report.id} // LOG_METADATA`}>
            <div className="space-y-6 py-2">
              
              <div className="border-b border-cyber-darkborder/30 pb-4">
                <span className="text-[10px] text-cyber-subtext uppercase">AFFECTED WEBPAGE</span>
                <h2 className="text-sm font-bold text-cyber-text tracking-wider uppercase mt-0.5">{report.pageCategory}</h2>
                <a href={report.pageUrl} target="_blank" rel="noopener noreferrer" className="text-cyber-border hover:underline text-[10px] block mt-1 truncate">
                  {report.pageUrl}
                </a>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-cyber-text font-bold uppercase block mb-1">&gt; PROBLEM DESCRIPTION</span>
                  <p className="text-cyber-subtext whitespace-pre-wrap leading-relaxed bg-black/20 p-3 border border-cyber-darkborder/25">{report.description}</p>
                </div>
                
                <div>
                  <span className="text-cyber-text font-bold uppercase block mb-1">&gt; EXPECTED BEHAVIOUR</span>
                  <p className="text-cyber-subtext whitespace-pre-wrap leading-relaxed bg-black/20 p-3 border border-cyber-darkborder/25">{report.expectedBehaviour}</p>
                </div>

                <div>
                  <span className="text-cyber-text font-bold uppercase block mb-1">&gt; ACTUAL BEHAVIOUR</span>
                  <p className="text-cyber-subtext whitespace-pre-wrap leading-relaxed bg-black/20 p-3 border border-cyber-darkborder/25">{report.actualBehaviour}</p>
                </div>

                {report.suggestedSolution && (
                  <div>
                    <span className="text-cyber-text font-bold uppercase block mb-1">&gt; SUGGESTED SOLUTION</span>
                    <p className="text-cyber-subtext whitespace-pre-wrap leading-relaxed bg-black/20 p-3 border border-cyber-darkborder/25">{report.suggestedSolution}</p>
                  </div>
                )}
              </div>

              {report.screenshotUrl && (
                <div className="space-y-2 pt-2 border-t border-cyber-darkborder/30">
                  <span className="text-cyber-text font-bold uppercase">&gt; EVIDENCE MATERIAL</span>
                  <div className="border border-cyber-darkborder p-2 bg-black/40">
                    <img src={report.screenshotUrl} alt="Evidence screenshot" className="w-full max-h-96 object-contain border border-cyber-darkborder/50" />
                  </div>
                </div>
              )}

            </div>
          </Card>
        </div>

        {/* Right pane: Review Actions */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Student details summary */}
          <Card title="STUDENT_CREDENTIALS" headerControls={false}>
            <div className="space-y-2 font-mono text-xs text-cyber-subtext py-2">
              <div className="flex justify-between border-b border-cyber-darkborder/20 pb-1">
                <span>NAME:</span>
                <span className="text-cyber-text font-bold"><span className="mr-2">{report.avatarEmoji || '👾'}</span>{report.studentName}</span>
              </div>
              <div className="flex justify-between border-b border-cyber-darkborder/20 pb-1">
                <span>MOBILE:</span>
                <span className="text-cyber-text">{report.studentMobile}</span>
              </div>
              <div className="flex justify-between">
                <span>CLASS:</span>
                <span className="text-cyber-text uppercase">{report.branch} - {report.section}</span>
              </div>
            </div>
          </Card>

          {/* Action form */}
          <Card title="REVIEW_ACTIONS" headerControls={false}>
            <form onSubmit={handleUpdate} className="space-y-4 py-2 font-mono text-xs">
              
              {/* Status */}
              <div className="space-y-1">
                <label className="block text-cyber-text uppercase font-bold">Verification Status</label>
                <select 
                  name="status" 
                  value={form.status} 
                  onChange={handleFormChange}
                  className="w-full bg-cyber-card border border-cyber-darkborder p-3 min-h-[48px] text-cyber-text text-xs focus:outline-none focus:border-cyber-border"
                >
                  <option value="NEW">NEW</option>
                  <option value="UNDER REVIEW">UNDER REVIEW</option>
                  <option value="VALID">VALID</option>
                  <option value="INVALID">INVALID</option>
                  <option value="DUPLICATE">DUPLICATE</option>
                  <option value="NEEDS MORE INFORMATION">NEEDS MORE INFORMATION</option>
                  <option value="PRIORITIZED">PRIORITIZED</option>
                  <option value="IN PROGRESS">IN PROGRESS</option>
                  <option value="FIXED">FIXED</option>
                  <option value="VERIFIED">VERIFIED</option>
                </select>
              </div>

              {/* Official Severity */}
              <div className="space-y-1">
                <label className="block text-cyber-text uppercase font-bold">Official Severity</label>
                <select 
                  name="officialSeverity" 
                  value={form.officialSeverity} 
                  onChange={handleFormChange}
                  className="w-full bg-cyber-card border border-cyber-darkborder p-3 min-h-[48px] text-cyber-text text-xs focus:outline-none focus:border-cyber-border"
                >
                  <option value="Minor">Minor</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Major">Major</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              {/* Points */}
              <div className="space-y-1">
                <label className="block text-cyber-text uppercase font-bold">Awarded Points</label>
                <input 
                  type="number" 
                  name="points" 
                  value={form.points} 
                  onChange={handleFormChange}
                  className="w-full bg-cyber-card border border-cyber-darkborder p-3 min-h-[48px] text-cyber-text text-xs focus:outline-none focus:border-cyber-border"
                />
              </div>

              {/* Flags */}
              <div className="space-y-2 pt-2 border-t border-cyber-darkborder/20">
                <label className="flex items-center space-x-2 cursor-pointer hover:text-cyber-text text-cyber-subtext min-h-[44px]">
                  <input 
                    type="checkbox" 
                    name="duplicate" 
                    checked={form.duplicate} 
                    onChange={handleFormChange}
                    className="accent-cyber-border"
                  />
                  <span>Mark as Duplicate Report</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer hover:text-cyber-text text-cyber-subtext min-h-[44px]">
                  <input 
                    type="checkbox" 
                    name="firstReport" 
                    checked={form.firstReport} 
                    onChange={handleFormChange}
                    className="accent-cyber-border"
                  />
                  <span>First Valid Report (+10 pts bonus)</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer hover:text-cyber-text text-cyber-subtext min-h-[44px]">
                  <input 
                    type="checkbox" 
                    name="fixed" 
                    checked={form.fixed} 
                    onChange={handleFormChange}
                    className="accent-cyber-border"
                  />
                  <span>Bug Fixed (Code deployed)</span>
                </label>
              </div>

              {/* Internal Notes */}
              <div className="space-y-1 pt-2 border-t border-cyber-darkborder/20">
                <label className="block text-cyber-text uppercase font-bold">Internal Reviewer Notes (Private)</label>
                <textarea 
                  name="internalNotes" 
                  value={form.internalNotes} 
                  onChange={handleFormChange}
                  placeholder="Notes visible only to admin reviewers..." 
                  rows={3}
                  className="w-full bg-cyber-card border border-cyber-darkborder p-3 min-h-[120px] text-cyber-text text-xs font-mono focus:outline-none focus:border-cyber-border"
                />
              </div>

              {/* Status Update feedback banner */}
              {updateSuccess && (
                <div className="border border-cyber-green bg-cyber-green/10 p-2 text-center text-cyber-green text-[10px] font-bold uppercase animate-pulse">
                  REPORT LOG UPDATED SECURELY
                </div>
              )}

              {/* Save CTA */}
              <TerminalButton 
                type="submit" 
                variant="primary" 
                className="w-full py-4 min-h-[48px] flex items-center justify-center space-x-2"
                disabled={isUpdating}
              >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>UPDATE REPORT</span>
              </TerminalButton>

            </form>
          </Card>
        </div>

      </div>

    </div>
  );
}
