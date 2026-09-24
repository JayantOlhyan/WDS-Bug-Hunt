"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/Card';
import { TerminalButton } from '@/components/TerminalButton';
import { ReportReviewModal } from '@/components/ReportReviewModal';
import { Loader2, Key, Search, ChevronRight, Filter, LayoutGrid, CheckSquare, Layers, AlertCircle, RefreshCw, CheckCircle2, X } from 'lucide-react';
import { BugReport } from '@/types';

export default function AdminDashboard() {
  const router = useRouter();
  
  // Auth state
  const [pin, setPin] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Data state
  const [reports, setReports] = useState<BugReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Active Menu / Filter states
  // Default to 'REVIEW QUEUE' with 'PENDING' status so unsolved reports are shown by default
  const [activeTab, setActiveTab] = useState('REVIEW QUEUE');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [pageFilter, setPageFilter] = useState('ALL');

  // Overlay state
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Check cached Admin session on mount
  useEffect(() => {
    const session = sessionStorage.getItem('msit_bughunt_admin');
    if (session === 'true') {
      setIsAdmin(true);
      fetchReports();
    }
  }, []);

  const fetchReports = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    setFetchError(null);

    try {
      const res = await fetch('/api/bugs');
      if (!res.ok) throw new Error('Failed to fetch bug reports.');
      const data = await res.json();
      setReports(data);
    } catch (err: any) {
      setFetchError(err.message || 'An error occurred loading reports queue.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      if (res.ok) {
        sessionStorage.setItem('msit_bughunt_admin', 'true');
        setIsAdmin(true);
        fetchReports();
      } else {
        setAuthError('INVALID ACCESS TOKEN. DEVIATION REJECTED.');
      }
    } catch (err) {
      setAuthError('CONNECTION ERROR. TRY AGAIN.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('msit_bughunt_admin');
    setIsAdmin(false);
    setPin('');
  };

  // Stat calculations
  const totalBugs = reports.length;
  // Pending bugs: unsolved bugs waiting for review
  const pendingBugs = reports.filter(
    (r) => (r.status === 'NEW' || r.status === 'UNDER REVIEW' || r.status === 'NEEDS MORE INFORMATION') && !r.fixed
  ).length;
  // Reviewed bugs: reports that have undergone verification or resolution
  const reviewedBugs = reports.filter(
    (r) => (r.status !== 'NEW' && r.status !== 'UNDER REVIEW' && r.status !== 'NEEDS MORE INFORMATION') || r.fixed
  ).length;
  const validBugs = reports.filter((r) => r.status === 'VALID' || r.status === 'FIXED' || r.status === 'VERIFIED').length;
  const duplicateBugs = reports.filter((r) => r.status === 'DUPLICATE').length;
  const fixedBugs = reports.filter((r) => r.fixed || r.status === 'FIXED' || r.status === 'VERIFIED').length;

  // Filter logic
  const getFilteredReports = () => {
    return reports.filter((r) => {
      // Search text matches ID or Student Name or Mobile
      const matchesSearch =
        r.id.toLowerCase().includes(search.toLowerCase()) ||
        r.studentName.toLowerCase().includes(search.toLowerCase()) ||
        r.studentMobile.includes(search);

      // Status Match
      let matchesStatus = true;
      if (statusFilter === 'ALL') {
        matchesStatus = true;
      } else if (statusFilter === 'PENDING') {
        // Pending queue: unsolved reports only
        matchesStatus = (r.status === 'NEW' || r.status === 'UNDER REVIEW' || r.status === 'NEEDS MORE INFORMATION') && !r.fixed;
      } else if (statusFilter === 'REVIEWED') {
        // Reviewed reports only
        matchesStatus = (r.status !== 'NEW' && r.status !== 'UNDER REVIEW' && r.status !== 'NEEDS MORE INFORMATION') || r.fixed;
      } else {
        matchesStatus = r.status === statusFilter;
      }

      // Severity Match
      const matchesSeverity =
        severityFilter === 'ALL' || r.studentSeverity === severityFilter || r.officialSeverity === severityFilter;

      // Page category Match
      const matchesPage = pageFilter === 'ALL' || r.pageCategory === pageFilter;

      return matchesSearch && matchesStatus && matchesSeverity && matchesPage;
    });
  };

  // Callback when a report is updated in the review overlay
  const handleReportUpdated = (updatedBug: BugReport) => {
    setReports((prev) => prev.map((r) => (r.id === updatedBug.id ? updatedBug : r)));
    setToastMessage(`REPORT [${updatedBug.id}] UPDATED TO ${updatedBug.status} (${updatedBug.points} PTS)`);
    setTimeout(() => setToastMessage(null), 5000);
    // Silently sync with backend
    fetchReports(true);
  };

  const statusBadgeClasses: Record<string, string> = {
    'NEW': 'border-cyber-subtext text-cyber-subtext bg-cyber-subtext/10',
    'UNDER REVIEW': 'border-cyber-yellow text-cyber-yellow bg-cyber-yellow/10 text-glow',
    'VALID': 'border-cyber-green text-cyber-green bg-cyber-green/10 text-glow-green',
    'INVALID': 'border-cyber-red/60 text-cyber-red/70 bg-cyber-red/10',
    'DUPLICATE': 'border-cyber-red text-cyber-red bg-cyber-red/20 text-glow-red',
    'FIXED': 'border-cyber-green text-cyber-green bg-cyber-green/20 text-glow-green font-bold',
    'VERIFIED': 'border-cyber-green text-cyber-green bg-cyber-green/20 text-glow-green font-bold',
    'NEEDS MORE INFORMATION': 'border-cyber-yellow/80 text-cyber-yellow/90 bg-cyber-yellow/10',
    'PRIORITIZED': 'border-cyber-yellow text-cyber-yellow bg-cyber-yellow/10',
    'IN PROGRESS': 'border-cyber-yellow text-cyber-yellow bg-cyber-yellow/10',
  };

  // PIN Access gate
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-16">
        <Card title="ADMIN_SECURITY_GATE">
          <form onSubmit={handleVerifyPin} className="font-mono text-xs space-y-4 py-4">
            <div className="flex items-center space-x-2 text-cyber-yellow">
              <Key className="h-5 w-5 animate-pulse" />
              <span className="font-bold tracking-widest text-glow">VERIFICATION REQUIRED</span>
            </div>
            
            <p className="text-cyber-subtext">Enter the WDS Administrator credentials code to access the verification control panel:</p>
            
            <div className="space-y-1">
              <label htmlFor="adminPin" className="block text-cyber-text uppercase font-bold">Admin Pin</label>
              <input 
                type="password" 
                id="adminPin" 
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••••" 
                className="w-full bg-cyber-card border border-cyber-darkborder focus:border-cyber-border focus:outline-none p-3 min-h-[48px] text-center text-cyber-text text-sm tracking-[6px]"
                required
                autoFocus
              />
            </div>

            {authError && (
              <p className="text-[10px] text-cyber-red font-bold uppercase text-glow-red text-center">{authError}</p>
            )}

            <TerminalButton type="submit" variant="primary" className="w-full py-4 min-h-[48px] flex items-center justify-center space-x-2" disabled={isVerifying}>
              {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              <span>AUTHENTICATE</span>
            </TerminalButton>
          </form>
        </Card>
      </div>
    );
  }

  const filteredReports = getFilteredReports();

  const menuItems = [
    { name: 'REVIEW QUEUE', count: pendingBugs, filterValue: 'PENDING' },
    { name: 'REVIEWED', count: reviewedBugs, filterValue: 'REVIEWED' },
    { name: 'ALL REPORTS', count: totalBugs, filterValue: 'ALL' },
    { name: 'VALID REPORTS', count: validBugs, filterValue: 'VALID' },
    { name: 'DUPLICATES', count: duplicateBugs, filterValue: 'DUPLICATE' },
    { name: 'SETTINGS', count: null, filterValue: null },
  ];

  return (
    <div className="space-y-8 font-mono text-xs">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="bg-cyber-card border-2 border-cyber-green p-3 shadow-cyber-glow-green text-cyber-green font-bold flex items-center justify-between animate-in slide-in-from-top duration-300">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0 animate-pulse" />
            <span>&gt;_ {toastMessage}</span>
          </div>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-cyber-green hover:underline text-[10px] flex items-center space-x-1"
          >
            <span>[DISMISS]</span>
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Admin Header */}
      <div className="flex items-center justify-between border-b border-cyber-darkborder pb-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold uppercase tracking-wider text-cyber-text text-glow">
            &gt;_ WDS REVIEW CONSOLE
          </h1>
          <p className="text-cyber-subtext text-[11px]">
            MSIT Bug Hunt Validation & Point Assignment Workspace
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <TerminalButton 
            variant="secondary" 
            onClick={() => fetchReports(true)}
            disabled={isRefreshing}
            className="p-3 min-h-[48px]"
            title="Refresh database records"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </TerminalButton>
          <TerminalButton variant="danger" onClick={handleLogout} className="text-xs px-4 py-3 min-h-[48px]">
            DE-AUTH
          </TerminalButton>
        </div>
      </div>

      {/* Review Dashboard Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { title: 'TOTAL LOGGED', val: totalBugs, color: 'text-cyber-text' },
          { title: 'PENDING REVIEW', val: pendingBugs, color: 'text-cyber-yellow text-glow' },
          { title: 'VALID REPORTS', val: validBugs, color: 'text-cyber-green text-glow-green' },
          { title: 'DUPLICATES', val: duplicateBugs, color: 'text-cyber-red' },
          { title: 'FIXED BUGS', val: fixedBugs, color: 'text-cyber-green text-glow-green' }
        ].map((stat, idx) => (
          <Card key={idx} title={stat.title} headerControls={false}>
            <div className="py-1">
              <span className={`text-2xl font-black block ${stat.color}`}>{stat.val}</span>
              <span className="text-[8px] text-cyber-subtext uppercase">SYSTEM SYNCED</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Queue Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Navigation Sidebar Panel */}
        <div className="lg:col-span-3">
          <Card title="MENU" headerControls={false}>
            <div className="space-y-1 py-1 font-mono text-xs">
              {menuItems.map((item, idx) => {
                const isActive = activeTab === item.name;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (item.filterValue !== null) {
                        setActiveTab(item.name);
                        setStatusFilter(item.filterValue);
                      }
                    }}
                    className={`w-full flex items-center justify-between p-4 min-h-[48px] border-b border-cyber-darkborder/20 text-left hover:text-cyber-text hover:bg-white/5 transition-all ${
                      isActive 
                        ? 'text-cyber-text font-bold bg-cyber-card border border-cyber-border shadow-cyber-glow' 
                        : 'text-cyber-subtext'
                    }`}
                  >
                    <span>&gt; {item.name}</span>
                    {item.count !== null && (
                      <span className={`px-1.5 py-0.5 border text-[9px] ${
                        isActive 
                          ? 'bg-cyber-text text-black border-cyber-text font-bold' 
                          : 'bg-black border-cyber-darkborder text-cyber-text'
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Queue Table Pane */}
        <div className="lg:col-span-9 space-y-4">
          <Card title={`SUBMISSIONS_QUEUE // [${activeTab || statusFilter}: ${filteredReports.length}]`}>
            <div className="space-y-4">
              
              {/* Filter controls */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 border-b border-cyber-darkborder/20 pb-4">
                {/* Search */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-cyber-subtext">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search Report ID or Student..."
                    className="w-full bg-cyber-card border border-cyber-darkborder focus:border-cyber-border focus:outline-none pl-8 p-3 min-h-[48px] text-cyber-text text-xs"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    const val = e.target.value;
                    setStatusFilter(val);
                    if (val === 'PENDING') setActiveTab('REVIEW QUEUE');
                    else if (val === 'REVIEWED') setActiveTab('REVIEWED');
                    else if (val === 'ALL') setActiveTab('ALL REPORTS');
                    else if (val === 'VALID') setActiveTab('VALID REPORTS');
                    else if (val === 'DUPLICATE') setActiveTab('DUPLICATES');
                    else setActiveTab('');
                  }}
                  className="bg-cyber-card border border-cyber-darkborder p-3 min-h-[48px] text-cyber-text text-xs focus:outline-none focus:border-cyber-border"
                >
                  <option value="PENDING">PENDING REVIEW (UNSOLVED)</option>
                  <option value="REVIEWED">REVIEWED ONLY</option>
                  <option value="ALL">ALL STATUSES</option>
                  <option value="NEW">NEW</option>
                  <option value="UNDER REVIEW">UNDER REVIEW</option>
                  <option value="VALID">VALID</option>
                  <option value="INVALID">INVALID</option>
                  <option value="DUPLICATE">DUPLICATE</option>
                  <option value="NEEDS MORE INFORMATION">NEEDS MORE INFO</option>
                  <option value="FIXED">FIXED</option>
                  <option value="VERIFIED">VERIFIED</option>
                </select>

                {/* Severity Filter */}
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="bg-cyber-card border border-cyber-darkborder p-3 min-h-[48px] text-cyber-text text-xs focus:outline-none focus:border-cyber-border"
                >
                  <option value="ALL">ALL SEVERITIES</option>
                  <option value="Minor">MINOR</option>
                  <option value="Moderate">MODERATE</option>
                  <option value="Major">MAJOR</option>
                  <option value="Critical">CRITICAL</option>
                </select>

                {/* Page Filter */}
                <select
                  value={pageFilter}
                  onChange={(e) => setPageFilter(e.target.value)}
                  className="bg-cyber-card border border-cyber-darkborder p-3 min-h-[48px] text-cyber-text text-xs focus:outline-none focus:border-cyber-border"
                >
                  <option value="ALL">ALL PAGES</option>
                  <option value="Home">Home</option>
                  <option value="About MSIT">About MSIT</option>
                  <option value="Academics">Academics</option>
                  <option value="Faculty">Faculty</option>
                  <option value="Events">Events</option>
                  <option value="Contact">Contact</option>
                </select>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono">
                  <thead>
                    <tr className="border-b border-cyber-darkborder bg-cyber-card text-cyber-text">
                      <th className="p-3 text-[10px] uppercase font-bold tracking-wider w-12 sm:w-16">ID</th>
                      <th className="p-3 text-[10px] uppercase font-bold tracking-wider">STUDENT</th>
                      <th className="p-3 text-[10px] uppercase font-bold tracking-wider hidden sm:table-cell">PAGE</th>
                      <th className="p-3 text-[10px] uppercase font-bold tracking-wider hidden sm:table-cell">SEVERITY (EST.)</th>
                      <th className="p-3 text-[10px] uppercase font-bold tracking-wider">STATUS</th>
                      <th className="p-3 text-[10px] uppercase font-bold tracking-wider hidden md:table-cell">SUBMITTED</th>
                      <th className="p-3 text-[10px] uppercase font-bold tracking-wider text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyber-darkborder/30">
                    {filteredReports.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-cyber-subtext uppercase text-[10px]">
                          Queue is clean. No records found for active filter.
                        </td>
                      </tr>
                    ) : (
                      filteredReports.map((report) => (
                        <tr 
                          key={report.id} 
                          onClick={() => setSelectedReportId(report.id)}
                          className="hover:bg-white/5 transition-colors group cursor-pointer"
                        >
                          <td className="p-3 font-bold text-cyber-text">{report.id}</td>
                          <td className="p-3 font-bold text-cyber-text">
                            <span className="mr-2">{report.avatarEmoji || '👾'}</span>
                            {report.studentName}
                          </td>
                          <td className="p-3 text-cyber-subtext hidden sm:table-cell">{report.pageCategory}</td>
                          <td className="p-3 hidden sm:table-cell">
                            <span className="text-cyber-yellow">{report.studentSeverity || 'Minor'}</span>
                          </td>
                          <td className="p-3">
                            <span className={`inline-block px-1.5 py-0.5 text-[9px] uppercase font-bold border ${
                              statusBadgeClasses[report.status] || 'border-cyber-darkborder text-cyber-subtext'
                            }`}>
                              {report.status}
                            </span>
                          </td>
                          <td className="p-3 text-cyber-subtext hidden md:table-cell">
                            {new Date(report.submittedAt).toLocaleDateString()}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedReportId(report.id);
                              }}
                              className="border border-cyber-border text-cyber-text hover:bg-cyber-border hover:text-black font-bold uppercase transition-all px-3 py-2 sm:px-2 sm:py-1 text-[10px] min-h-[44px]"
                            >
                              Review &gt;
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </Card>
        </div>

      </div>

      {/* Review Overlay Modal */}
      <ReportReviewModal
        isOpen={!!selectedReportId}
        reportId={selectedReportId}
        reportsList={filteredReports}
        onClose={() => setSelectedReportId(null)}
        onSelectReport={(id) => setSelectedReportId(id)}
        onUpdated={handleReportUpdated}
      />

    </div>
  );
}
