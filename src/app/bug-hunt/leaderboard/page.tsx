"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Loader2, Award, Calendar, Users, Filter, RefreshCw } from 'lucide-react';
import { Student, Badge } from '@/types';

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<'overall' | 'monthly' | 'orientation' | 'branch'>('overall');
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');
  const [students, setStudents] = useState<Student[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);
    try {
      // Fetch leaderboard (returns sorted student list)
      const res = await fetch('/api/leaderboard');
      if (!res.ok) throw new Error('Failed to retrieve leaderboard data.');
      const data = await res.json();
      setStudents(data);

      // Fetch badges definitions to map icons
      const badgesRes = await fetch('/api/badges');
      if (badgesRes.ok) {
        const badgesData = await badgesRes.json();
        setBadges(badgesData);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred loading standings.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // Format student name to mask private data (e.g. Jayant M.)
  const formatStudentName = (fullName: string) => {
    if (!fullName) return '';
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) return parts[0];
    const firstName = parts[0];
    const lastInitial = parts[parts.length - 1].charAt(0);
    return `${firstName} ${lastInitial}.`;
  };

  // Filter students based on selected branch and active tab
  const getFilteredStudents = () => {
    let list = [...students];

    // Branch filter
    if (selectedBranch !== 'ALL') {
      list = list.filter(s => s.branch.toUpperCase() === selectedBranch.toUpperCase());
    }

    // Tab-specific simulation (Mocking monthly and orientations list for UI demonstration)
    if (activeTab === 'monthly') {
      // Filter students registered/contributed within last 30 days
      list = list.filter(s => {
        const createdDate = new Date(s.createdAt);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return createdDate >= thirtyDaysAgo;
      });
    } else if (activeTab === 'orientation') {
      // Only show students who signed up via orientations
      list = list.filter(s => !!s.orientationId);
    } else if (activeTab === 'branch') {
      // Grouping by branch is handled by the selectedBranch dropdown; 
      // here we just filter to ensure we show active branch players
    }

    return list;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 font-mono text-xs text-cyber-subtext space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-cyber-border" />
        <span>COMPILING STANDINGS MATRIX...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto py-12 space-y-4 font-mono text-xs text-center">
        <div className="border border-cyber-red bg-cyber-red/10 p-4 text-cyber-red shadow-cyber-glow-red">
          {error}
        </div>
        <button 
          onClick={() => fetchLeaderboard()} 
          className="border border-cyber-border text-cyber-text px-4 py-2 hover:bg-cyber-border hover:text-black font-bold uppercase transition-all"
        >
          RETRY
        </button>
      </div>
    );
  }

  const filteredStudents = getFilteredStudents();

  return (
    <div className="space-y-8 font-mono text-xs">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-cyber-darkborder pb-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold uppercase tracking-wider text-cyber-text text-glow">
            &gt;_ STANDINGS
          </h1>
          <p className="text-cyber-subtext text-[11px]">
            Top bug hunters and quality contributors of MSIT
          </p>
        </div>
        
        <button 
          onClick={() => fetchLeaderboard(true)} 
          disabled={isRefreshing}
          className="border border-cyber-darkborder p-2 text-cyber-subtext hover:text-cyber-text transition-colors"
          title="Refresh rankings"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Leaderboard tabs & filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyber-darkborder/30 pb-4">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'overall', name: 'OVERALL', icon: Award },
            { id: 'monthly', name: 'MONTHLY', icon: Calendar },
            { id: 'orientation', name: 'ORIENTATION', icon: Users },
            { id: 'branch', name: 'BRANCH STANDINGS', icon: Filter }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (tab.id === 'branch' && selectedBranch === 'ALL') {
                    setSelectedBranch('CSE'); // Default to CSE when switching specifically to Branch stand
                  } else if (tab.id !== 'branch') {
                    setSelectedBranch('ALL');
                  }
                }}
                className={`flex flex-1 sm:flex-none justify-center items-center space-x-1.5 px-3 py-3 sm:py-1.5 min-h-[44px] border font-bold transition-all text-[10px] ${
                  isActive 
                    ? 'border-cyber-border text-cyber-text bg-cyber-card shadow-cyber-glow' 
                    : 'border-cyber-darkborder/40 text-cyber-subtext hover:text-cyber-text'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Branch Selector Dropdown */}
        <div className="flex items-center space-x-2">
          <span className="text-cyber-subtext text-[10px] uppercase font-bold">DEPT_FILTER:</span>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="bg-cyber-card border border-cyber-darkborder p-3 min-h-[48px] w-full sm:w-auto text-cyber-text text-xs focus:outline-none focus:border-cyber-border"
          >
            <option value="ALL">ALL BRANCHES</option>
            <option value="CSE">CSE (COMP. SCIENCE)</option>
            <option value="IT">IT (INFO. TECH)</option>
            <option value="ECE">ECE (ELEC. & COMM.)</option>
            <option value="EEE">EEE (ELEC. & ELTR.)</option>
            <option value="CVE">CVE (CIVIL ENG.)</option>
          </select>
        </div>
      </div>

      {/* Leaderboard Table Card */}
      <Card title={`${activeTab.toUpperCase()}_LEADERBOARD // INDEX_SUM`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono">
            <thead>
              <tr className="border-b border-cyber-darkborder bg-cyber-card text-cyber-text">
                <th className="p-3 text-[10px] uppercase font-bold tracking-wider w-12 sm:w-16">RANK</th>
                <th className="p-3 text-[10px] uppercase font-bold tracking-wider">STUDENT</th>
                <th className="p-3 text-[10px] uppercase font-bold tracking-wider hidden sm:table-cell">BRANCH</th>
                <th className="p-3 text-[10px] uppercase font-bold tracking-wider hidden sm:table-cell">VERIFIED BUGS</th>
                <th className="p-3 text-[10px] uppercase font-bold tracking-wider">POINTS</th>
                <th className="p-3 text-[10px] uppercase font-bold tracking-wider text-right hidden sm:table-cell">BADGES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-darkborder/30">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-cyber-subtext uppercase text-[10px]">
                    No student records found under these filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((stud, idx) => {
                  const rank = idx + 1;
                  // Glow highlights for top 3
                  const rankStyles = [
                    'text-cyber-yellow font-extrabold text-glow',
                    'text-cyber-text font-bold opacity-90',
                    'text-cyber-text font-semibold opacity-75',
                  ];
                  
                  return (
                    <tr 
                      key={stud.enrollmentNumber} 
                      className={`hover:bg-white/5 transition-colors ${rank <= 3 ? 'bg-cyber-card/30' : ''}`}
                    >
                      <td className={`p-3 font-bold ${rankStyles[rank - 1] || 'text-cyber-subtext'}`}>
                        {rank}
                      </td>
                      <td className="p-3 font-bold text-cyber-text">
                        {formatStudentName(stud.name)}
                      </td>
                      <td className="p-3 text-cyber-subtext hidden sm:table-cell">{stud.branch}</td>
                      <td className="p-3 text-cyber-text hidden sm:table-cell">{stud.validReports} BUGS</td>
                      <td className="p-3 font-bold text-cyber-green text-glow">{stud.totalPoints} PTS</td>
                      <td className="p-3 text-right hidden sm:table-cell">
                        <div className="flex justify-end space-x-1.5">
                          {stud.badges.length === 0 ? (
                            <span className="text-[9px] text-cyber-subtext">-</span>
                          ) : (
                            stud.badges.map((bId) => {
                              const badgeDef = badges.find(b => b.id === bId);
                              return (
                                <span 
                                  key={bId} 
                                  className="text-base select-none cursor-help"
                                  title={`${badgeDef?.name || bId}: ${badgeDef?.description || ''}`}
                                >
                                  {badgeDef?.icon || '🏅'}
                                </span>
                              );
                            })
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="text-[10px] text-cyber-subtext text-center italic">
        * Rankings automatically update every 10 minutes. Ties resolved by: 1. Resolved Bugs, 2. Valid Bugs, 3. Earliest report log.
      </div>

    </div>
  );
}
