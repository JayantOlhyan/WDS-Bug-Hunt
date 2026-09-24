"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { TerminalButton } from '@/components/TerminalButton';
import { Loader2, ArrowLeft, Save, ExternalLink, Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { BugReport } from '@/types';

interface ReportReviewModalProps {
  reportId: string | null;
  reportsList: BugReport[];
  isOpen: boolean;
  onClose: () => void;
  onSelectReport: (id: string) => void;
  onUpdated: (updatedBug: BugReport) => void;
}

export const ReportReviewModal: React.FC<ReportReviewModalProps> = ({
  reportId,
  reportsList,
  isOpen,
  onClose,
  onSelectReport,
  onUpdated,
}) => {
  const [report, setReport] = useState<BugReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  // Form state
  const [form, setForm] = useState({
    status: 'NEW' as BugReport['status'],
    officialSeverity: 'Minor',
    points: 0,
    duplicate: false,
    firstReport: false,
    fixed: false,
    internalNotes: '',
  });

  // Handle escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isImageExpanded) {
          setIsImageExpanded(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isImageExpanded, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setIsImageExpanded(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Fetch / initialize report when reportId changes
  useEffect(() => {
    if (!reportId || !isOpen) {
      setReport(null);
      return;
    }

    // First initialize immediately from local queue list if present for instant rendering
    const localBug = reportsList.find((r) => r.id === reportId);
    if (localBug) {
      setReport(localBug);
      setForm({
        status: localBug.status,
        officialSeverity: localBug.officialSeverity || localBug.studentSeverity || 'Minor',
        points: localBug.points || 0,
        duplicate: localBug.duplicate || false,
        firstReport: localBug.firstReport || false,
        fixed: localBug.fixed || false,
        internalNotes: localBug.internalNotes || '',
      });
    }

    // Also fetch fresh details from API to ensure sync (e.g. internal notes, etc.)
    const fetchLatest = async () => {
      if (!localBug) setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/bugs/${reportId}`);
        if (!res.ok) throw new Error(`Report ID ${reportId} not found.`);
        const data: BugReport = await res.json();
        setReport(data);
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
        if (!localBug) {
          setError(err.message || 'An error occurred loading bug report details.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatest();
  }, [reportId, isOpen, reportsList]);

  if (!isOpen || !reportId) return null;

  // Navigation indices
  const currentIndex = reportsList.findIndex((r) => r.id === reportId);
  const prevReport = currentIndex > 0 ? reportsList[currentIndex - 1] : null;
  const nextReport = currentIndex >= 0 && currentIndex < reportsList.length - 1 ? reportsList[currentIndex + 1] : null;

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/bugs/${reportId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Failed to update report database.');

      const updatedData: BugReport = await res.json();
      onUpdated(updatedData);
      // Immediately go back to the main screen
      onClose();
    } catch (err: any) {
      alert(err.message || 'Update failed.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-start justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      
      {/* Lightbox / Expanded image modal */}
      {isImageExpanded && report?.screenshotUrl && (
        <div 
          className="fixed inset-0 z-60 bg-black/95 flex flex-col items-center justify-center p-4"
          onClick={() => setIsImageExpanded(false)}
        >
          <div className="w-full max-w-6xl flex justify-between items-center mb-2 text-cyber-text font-mono text-xs">
            <span>&gt;_ EVIDENCE_FULLSCREEN_VIEW [CLICK ANYWHERE OR ESC TO CLOSE]</span>
            <button 
              onClick={() => setIsImageExpanded(false)}
              className="p-2 border border-cyber-border text-cyber-text hover:bg-cyber-border hover:text-black"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <img 
            src={report.screenshotUrl} 
            alt="Expanded evidence" 
            className="max-h-[90vh] max-w-[95vw] object-contain border border-cyber-border shadow-cyber-glow" 
          />
        </div>
      )}

      {/* Main Review Modal Box */}
      <div 
        className="w-full max-w-6xl my-2 sm:my-6 font-mono text-xs relative space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Navigation & Close Bar */}
        <div className="flex items-center justify-between bg-cyber-bg border border-cyber-darkborder p-3 shadow-cyber-glow">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="inline-flex items-center space-x-1.5 text-cyber-subtext hover:text-cyber-text text-xs py-1.5 px-3 border border-cyber-darkborder hover:border-cyber-border transition-colors bg-cyber-card"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>BACK TO QUEUE</span>
            </button>
            <span className="text-[11px] text-cyber-subtext hidden md:inline">
              {'// OVERLAY ACTIVE'}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {reportsList.length > 0 && currentIndex !== -1 && (
              <div className="flex items-center space-x-2 text-[10px] text-cyber-subtext">
                <button
                  type="button"
                  disabled={!prevReport}
                  onClick={() => prevReport && onSelectReport(prevReport.id)}
                  className="px-2 py-1.5 border border-cyber-darkborder hover:border-cyber-border disabled:opacity-30 disabled:pointer-events-none text-cyber-text bg-cyber-card flex items-center space-x-1"
                  title="Previous report"
                >
                  <ChevronLeft className="h-3 w-3" />
                  <span className="hidden sm:inline">PREV</span>
                </button>
                <span className="px-2 py-1 bg-black border border-cyber-darkborder text-cyber-text font-bold">
                  {currentIndex + 1} / {reportsList.length}
                </span>
                <button
                  type="button"
                  disabled={!nextReport}
                  onClick={() => nextReport && onSelectReport(nextReport.id)}
                  className="px-2 py-1.5 border border-cyber-darkborder hover:border-cyber-border disabled:opacity-30 disabled:pointer-events-none text-cyber-text bg-cyber-card flex items-center space-x-1"
                  title="Next report"
                >
                  <span className="hidden sm:inline">NEXT</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-cyber-subtext hover:text-cyber-red border border-cyber-darkborder hover:border-cyber-red transition-colors bg-cyber-card"
              title="Close (Esc)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {isLoading && !report ? (
          <div className="flex flex-col items-center justify-center py-24 bg-cyber-card border border-cyber-darkborder space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-cyber-border" />
            <span className="text-cyber-subtext">RECONSTRUCTING BUG METADATA...</span>
          </div>
        ) : error || !report ? (
          <div className="p-8 text-center space-y-4 bg-cyber-card border border-cyber-red">
            <p className="text-cyber-red font-bold uppercase">{error || 'Record retrieval failure.'}</p>
            <TerminalButton variant="primary" onClick={onClose}>
              RETURN TO QUEUE
            </TerminalButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Pane: Bug Details */}
            <div className="lg:col-span-7 space-y-6">
              <Card title={`${report.id} // LOG_METADATA`} onClose={onClose}>
                <div className="space-y-6 py-2">
                  
                  {/* Affected Webpage */}
                  <div className="border-b border-cyber-darkborder/30 pb-4">
                    <span className="text-[10px] text-cyber-subtext uppercase">AFFECTED WEBPAGE</span>
                    <h2 className="text-sm font-bold text-cyber-text tracking-wider uppercase mt-0.5">
                      {report.pageCategory}
                    </h2>
                    {report.pageUrl && (
                      <a
                        href={report.pageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyber-border hover:underline text-[10px] inline-flex items-center space-x-1 mt-1 truncate max-w-full"
                      >
                        <span className="truncate">{report.pageUrl}</span>
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    )}
                  </div>

                  {/* Descriptions */}
                  <div className="space-y-4">
                    <div>
                      <span className="text-cyber-text font-bold uppercase block mb-1">
                        &gt; PROBLEM DESCRIPTION
                      </span>
                      <p className="text-cyber-subtext whitespace-pre-wrap leading-relaxed bg-black/30 p-3 border border-cyber-darkborder/25">
                        {report.description}
                      </p>
                    </div>

                    <div>
                      <span className="text-cyber-text font-bold uppercase block mb-1">
                        &gt; EXPECTED BEHAVIOUR
                      </span>
                      <p className="text-cyber-subtext whitespace-pre-wrap leading-relaxed bg-black/30 p-3 border border-cyber-darkborder/25">
                        {report.expectedBehaviour}
                      </p>
                    </div>

                    <div>
                      <span className="text-cyber-text font-bold uppercase block mb-1">
                        &gt; ACTUAL BEHAVIOUR
                      </span>
                      <p className="text-cyber-subtext whitespace-pre-wrap leading-relaxed bg-black/30 p-3 border border-cyber-darkborder/25">
                        {report.actualBehaviour}
                      </p>
                    </div>

                    {report.suggestedSolution && (
                      <div>
                        <span className="text-cyber-text font-bold uppercase block mb-1">
                          &gt; SUGGESTED SOLUTION
                        </span>
                        <p className="text-cyber-subtext whitespace-pre-wrap leading-relaxed bg-black/30 p-3 border border-cyber-darkborder/25">
                          {report.suggestedSolution}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Evidence Material */}
                  {report.screenshotUrl && (
                    <div className="space-y-2 pt-2 border-t border-cyber-darkborder/30">
                      <div className="flex items-center justify-between">
                        <span className="text-cyber-text font-bold uppercase">&gt; EVIDENCE MATERIAL</span>
                        <button
                          type="button"
                          onClick={() => setIsImageExpanded(true)}
                          className="text-[10px] text-cyber-border hover:underline inline-flex items-center space-x-1"
                        >
                          <Maximize2 className="h-3 w-3" />
                          <span>EXPAND IMAGE</span>
                        </button>
                      </div>
                      <div 
                        className="border border-cyber-darkborder p-2 bg-black/50 cursor-pointer group relative"
                        onClick={() => setIsImageExpanded(true)}
                        title="Click to view full size"
                      >
                        <img
                          src={report.screenshotUrl}
                          alt="Evidence screenshot"
                          className="w-full max-h-96 object-contain border border-cyber-darkborder/50 group-hover:opacity-90 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-cyber-text font-bold">
                          [CLICK TO ZOOM]
                        </div>
                      </div>
                    </div>
                  )}

                  {report.screenRecordingUrl && (
                    <div className="pt-2 border-t border-cyber-darkborder/30">
                      <span className="text-cyber-text font-bold uppercase block mb-1">&gt; SCREEN RECORDING</span>
                      <a
                        href={report.screenRecordingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyber-border hover:underline text-[10px] inline-flex items-center space-x-1"
                      >
                        <span>Open Screen Recording URL</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}

                </div>
              </Card>
            </div>

            {/* Right Pane: Student Credentials & Review Form */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Student Details Card */}
              <Card title="STUDENT_CREDENTIALS" headerControls={false}>
                <div className="space-y-2 font-mono text-xs text-cyber-subtext py-2">
                  <div className="flex justify-between border-b border-cyber-darkborder/20 pb-1">
                    <span>NAME:</span>
                    <span className="text-cyber-text font-bold">
                      <span className="mr-2">{report.avatarEmoji || '👾'}</span>
                      {report.studentName}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-cyber-darkborder/20 pb-1">
                    <span>MOBILE:</span>
                    <span className="text-cyber-text">{report.studentMobile}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CLASS:</span>
                    <span className="text-cyber-text uppercase">
                      {report.branch} - {report.section}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Review Actions Card */}
              <Card title="REVIEW_ACTIONS" headerControls={false}>
                <form onSubmit={handleUpdate} className="space-y-4 py-2 font-mono text-xs">
                  
                  {/* Status Selection */}
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

                  {/* Awarded Points */}
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

                  {/* Checkbox Flags */}
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
                      className="w-full bg-cyber-card border border-cyber-darkborder p-3 min-h-[100px] text-cyber-text text-xs font-mono focus:outline-none focus:border-cyber-border"
                    />
                  </div>

                  {/* Update Report CTA Button */}
                  <TerminalButton
                    type="submit"
                    variant="primary"
                    className="w-full py-4 min-h-[48px] flex items-center justify-center space-x-2 font-bold uppercase tracking-wider"
                    disabled={isUpdating}
                  >
                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    <span>UPDATE REPORT</span>
                  </TerminalButton>

                </form>
              </Card>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
