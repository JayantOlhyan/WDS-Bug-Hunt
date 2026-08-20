"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/Card';
import { TerminalButton } from '@/components/TerminalButton';
import { Loader2, Award, LogIn, ChevronRight, RefreshCw } from 'lucide-react';
import { BugReport, Student, Badge } from '@/types';

export default function StudentDashboard() {
  const router = useRouter();
  
  // UI and Sessions
  const [enrollment, setEnrollment] = useState('');
  const [sessionEnrollment, setSessionEnrollment] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data
  const [student, setStudent] = useState<Student | null>(null);
  const [reports, setReports] = useState<BugReport[]>([]);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);

  // Check cached session
  useEffect(() => {
    const cached = localStorage.getItem('msit_bughunt_student');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.mobileNumber) {
          setSessionEnrollment(parsed.mobileNumber);
          fetchDashboardData(parsed.mobileNumber);
        }
      } catch (e) {
        console.error("Error reading student session", e);
      }
    }
  }, []);

  const fetchDashboardData = async (enrollNum: string, silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      // Fetch student info
      const studentRes = await fetch(`/api/student/${enrollNum}`);
      if (!studentRes.ok) {
        if (studentRes.status === 404) {
          throw new Error(`Enrollment profile for ${enrollNum} not found. Submit a bug report first to register.`);
        }
        throw new Error('Failed to retrieve student profile.');
      }
      const studentData = await studentRes.json();
      setStudent(studentData);

      // Fetch student's reports
      const reportsRes = await fetch(`/api/student/${enrollNum}/reports`);
      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setReports(reportsData);
      }

      // Fetch active badges definition
      const badgesRes = await fetch('/api/badges');
      if (badgesRes.ok) {
        const badgesData = await badgesRes.json();
        setAllBadges(badgesData);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred fetching dashboard data.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollment.trim()) return;
    
    // Set temporary mock details to trigger session
    const mockStudentSession = { mobileNumber: enrollment.trim() };
    localStorage.setItem('msit_bughunt_student', JSON.stringify(mockStudentSession));
    setSessionEnrollment(enrollment.trim());
    fetchDashboardData(enrollment.trim());
  };

  const handleLogout = () => {
    localStorage.removeItem('msit_bughunt_student');
    setSessionEnrollment(null);
    setStudent(null);
    setReports([]);
  };

  // Login Gate
  if (!sessionEnrollment) {
    return (
      <div className="max-w-md mx-auto py-12">
        <Card title="STUDENT_LOGIN">
          <form onSubmit={handleLogin} className="font-mono text-xs space-y-4 py-4">
            <p className="text-cyber-subtext">Enter your Enrollment Number to view your dashboard, rankings, and bug reports:</p>
            
            <div className="space-y-1">
              <label htmlFor="enrollNum" className="block text-cyber-text uppercase font-bold">Enrollment Number</label>
              <input 
                type="text" 
                id="enrollNum"
                value={enrollment}
                onChange={(e) => setEnrollment(e.target.value)}
                placeholder="e.g. 0433010123" 
                className="w-full bg-cyber-card border border-cyber-darkborder focus:border-cyber-border focus:outline-none p-3 min-h-[48px] text-cyber-text text-xs"
                required 
              />
            </div>

            <TerminalButton type="submit" variant="primary" className="w-full py-4 min-h-[48px] flex items-center justify-center space-x-2">
              <LogIn className="h-4 w-4" />
              <span>ACCESS DASHBOARD</span>
            </TerminalButton>
            
            <p className="text-[10px] text-cyber-subtext text-center border-t border-cyber-darkborder/20 pt-3">
              Don&apos;t have a profile yet? <Link href="/bug-hunt/report" className="text-cyber-text underline">Submit a bug</Link> first to register automatically.
            </p>
          </form>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 font-mono text-xs text-cyber-subtext space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-cyber-border" />
        <span>DECRYPTING PROFILE STORAGE...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto py-12 space-y-4">
        <div className="border border-cyber-red bg-cyber-red/10 p-4 font-mono text-xs text-cyber-red">
          {error}
        </div>
        <div className="flex space-x-4">
          <TerminalButton variant="primary" onClick={handleLogout} className="flex-1 py-4 min-h-[48px]">
            CHANGE ENROLLMENT
          </TerminalButton>
          <TerminalButton variant="secondary" onClick={() => fetchDashboardData(sessionEnrollment)} className="flex-1 py-4 min-h-[48px]">
            RETRY
          </TerminalButton>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-mono text-xs">
      
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyber-darkborder pb-4">
        <div className="space-y-1">
          <span className="text-cyber-subtext text-[10px] uppercase">HUNTER PROFILE ACTIVE</span>
          <h1 className="text-2xl font-bold uppercase tracking-wider text-cyber-text text-glow">
            {student?.name || 'Loading Student...'}
          </h1>
          <p className="text-cyber-subtext text-[11px]">
            {student?.branch}-{student?.section} | EN. {student?.mobileNumber}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <TerminalButton 
            variant="secondary" 
            onClick={() => fetchDashboardData(sessionEnrollment, true)}
            disabled={isRefreshing}
            className="p-3 min-h-[48px]"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </TerminalButton>
          <TerminalButton variant="danger" onClick={handleLogout} className="text-xs px-4 py-3 min-h-[48px]">
            DISCONNECT
          </TerminalButton>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: 'TOTAL POINTS', val: `${student?.totalPoints || 0} PTS`, desc: student?.totalPoints && student.totalPoints > 100 ? 'Keep hunting!' : 'Start finding bugs!' },
          { title: 'CURRENT RANK', val: `#${student?.currentRank || 'N/A'}`, desc: student?.currentRank && student.currentRank <= 5 ? 'Great job!' : 'Join the top ranks!' },
          { title: 'VERIFIED BUGS', val: student?.validReports || 0, desc: 'Validated reports' },
          { title: 'FIXED BUGS', val: student?.fixedReports || 0, desc: 'Issues resolved' }
        ].map((stat, idx) => (
          <Card key={idx} title={stat.title} headerControls={false}>
            <div className="space-y-1 py-1">
              <span className="text-xl sm:text-2xl font-black text-cyber-text text-glow block">{stat.val}</span>
              <span className="text-[10px] text-cyber-subtext uppercase">{stat.desc}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Badges Drawer */}
      <Card title="EARNED_BADGES">
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 py-2">
          {allBadges.map((badge) => {
            const hasBadge = student?.badges.includes(badge.id);
            return (
              <div 
                key={badge.id} 
                className={`border p-3 text-center transition-all ${
                  hasBadge 
                    ? 'border-cyber-border bg-cyber-card shadow-cyber-glow' 
                    : 'border-cyber-darkborder/30 opacity-30 select-none'
                }`}
                title={badge.requirement}
              >
                <span className="text-2xl block mb-1">{badge.icon}</span>
                <span className="font-bold text-[10px] tracking-wider uppercase block truncate text-cyber-text">{badge.name}</span>
                <span className="text-[8px] text-cyber-subtext uppercase block leading-tight mt-0.5">{badge.description}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recent Submissions */}
      <Card title="RECENT_REPORTS_SUBMITTED">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono">
            <thead>
              <tr className="border-b border-cyber-darkborder bg-cyber-card text-cyber-text">
                <th className="p-3 text-[10px] uppercase font-bold tracking-wider w-12 sm:w-16">ID</th>
                <th className="p-3 text-[10px] uppercase font-bold tracking-wider hidden sm:table-cell">PAGE CATEGORY</th>
                <th className="p-3 text-[10px] uppercase font-bold tracking-wider">STATUS</th>
                <th className="p-3 text-[10px] uppercase font-bold tracking-wider hidden sm:table-cell">POINTS</th>
                <th className="p-3 text-[10px] uppercase font-bold tracking-wider hidden sm:table-cell">SUBMITTED</th>
                <th className="p-3 text-[10px] uppercase font-bold tracking-wider text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-darkborder/30">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-cyber-subtext uppercase text-[10px]">
                    No bug reports submitted yet.
                  </td>
                </tr>
              ) : (
                reports.map((report) => {
                  const statusColors = {
                    'NEW': 'border-cyber-subtext text-cyber-subtext',
                    'UNDER REVIEW': 'border-cyber-yellow text-cyber-yellow',
                    'VALID': 'border-cyber-green text-cyber-green',
                    'INVALID': 'border-cyber-red text-cyber-red opacity-60',
                    'DUPLICATE': 'border-cyber-red text-cyber-red',
                    'FIXED': 'border-cyber-green text-cyber-green text-glow-green',
                    'VERIFIED': 'border-cyber-green text-cyber-green text-glow-green',
                    'PRIORITIZED': 'border-cyber-yellow text-cyber-yellow',
                    'IN PROGRESS': 'border-cyber-yellow text-cyber-yellow',
                    'NEEDS MORE INFORMATION': 'border-cyber-yellow text-cyber-yellow',
                  };
                  
                  return (
                    <tr 
                      key={report.id}
                      onClick={() => router.push(`/dashboard/reports/${report.id}`)}
                      className="hover:bg-white/5 transition-colors cursor-pointer group"
                    >
                      <td className="p-3 font-bold text-cyber-text group-hover:text-glow">{report.id}</td>
                      <td className="p-3 text-cyber-subtext hidden sm:table-cell">{report.pageCategory}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 border text-[9px] uppercase font-bold ${statusColors[report.status] || 'border-cyber-border text-cyber-text'}`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-cyber-green hidden sm:table-cell">
                        {report.points > 0 ? `+${report.points}` : report.points}
                      </td>
                      <td className="p-3 text-cyber-subtext hidden sm:table-cell">{new Date(report.submittedAt).toLocaleDateString()}</td>
                      <td className="p-3 text-right">
                        <span className="inline-flex items-center text-cyber-text group-hover:text-glow">
                          DETAILS <ChevronRight className="h-4.5 w-4.5 ml-1 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
