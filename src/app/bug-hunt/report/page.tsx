"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/Card';
import { TerminalButton } from '@/components/TerminalButton';
import { Loader2, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

export default function BugReportForm() {
  const router = useRouter();
  
  // Student details cache
  const [details, setDetails] = useState({
    name: '',
    avatarEmoji: '👾',
    mobileNumber: '',
    branch: '',
    section: '',
    github: '',
    linkedin: '',
    wdsInterest: 'Yes',
  });

  // Bug details
  const [bug, setBug] = useState({
    pageCategory: '',
    pageUrl: '',
    description: '',
    expectedBehaviour: '',
    actualBehaviour: '',
    hasSuggestedSolution: 'No',
    suggestedSolution: '',
    studentSeverity: 'Minor',
  });

  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  
  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ id: string } | null>(null);

  // Load student details from localStorage
  useEffect(() => {
    const cached = localStorage.getItem('msit_bughunt_student');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setDetails(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Failed to parse cached student details", e);
      }
    }
  }, []);

  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleBugChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBug(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setScreenshot(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    // Validate details
    if (!details.name || !details.mobileNumber || !details.branch || !details.section) {
      setSubmitError("All fields in 'Your Details' are required.");
      setIsSubmitting(false);
      return;
    }

    // Validate screenshot (required for core release validation)
    if (!screenshot) {
      setSubmitError("Screenshot evidence is required to validate submissions.");
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Upload screenshot first
      const uploadFormData = new FormData();
      uploadFormData.append('file', screenshot);
      
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        throw new Error(errText || 'Failed to upload screenshot evidence.');
      }

      const { url: screenshotUrl } = await uploadRes.json();

      // 2. Submit bug report
      const payload = {
        ...details,
        ...bug,
        screenshotUrl,
      };

      const bugRes = await fetch('/api/bugs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!bugRes.ok) {
        const errText = await bugRes.text();
        throw new Error(errText || 'Failed to save bug report.');
      }

      const result = await bugRes.json();

      // Cache student details for next submissions
      localStorage.setItem('msit_bughunt_student', JSON.stringify(details));

      setSuccessData(result);
    } catch (err: any) {
      setSubmitError(err.message || 'Submission failed. Please check your network and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successData) {
    return (
      <div className="max-w-md mx-auto py-12">
        <Card title="SUBMISSION_SUCCESSFUL" className="border-cyber-green shadow-cyber-glow-green">
          <div className="font-mono text-center space-y-6 py-4">
            <CheckCircle className="h-16 w-16 text-cyber-green mx-auto animate-bounce" />
            <h2 className="text-xl font-bold uppercase tracking-wider text-cyber-green text-glow-green">
              BUG REPORT SUBMITTED
            </h2>
            
            <div className="border border-cyber-darkborder bg-black/40 p-4 font-mono text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-cyber-subtext">REPORT ID:</span>
                <span className="text-cyber-text font-bold tracking-widest">{successData.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cyber-subtext">STATUS:</span>
                <span className="text-cyber-yellow font-semibold">UNDER REVIEW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cyber-subtext">TIMESTAMP:</span>
                <span className="text-cyber-text">{new Date().toLocaleString()}</span>
              </div>
            </div>

            <p className="text-xs text-cyber-subtext leading-relaxed">
              WDS reviewers have queued your report. Once verified, points will be added to your profile dashboard.
            </p>

            <div className="flex flex-col gap-3">
              <TerminalButton 
                variant="primary"
                onClick={() => {
                  setSuccessData(null);
                  setBug({
                    pageCategory: '',
                    pageUrl: '',
                    description: '',
                    expectedBehaviour: '',
                    actualBehaviour: '',
                    hasSuggestedSolution: 'No',
                    suggestedSolution: '',
                    studentSeverity: 'Minor',
                  });
                  setScreenshot(null);
                  setScreenshotPreview(null);
                }}
              >
                SUBMIT ANOTHER BUG
              </TerminalButton>
              <TerminalButton 
                variant="secondary"
                onClick={() => router.push('/dashboard')}
              >
                GO TO DASHBOARD
              </TerminalButton>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2 border-b border-cyber-darkborder pb-4">
        <h1 className="text-2xl sm:text-3xl font-mono font-bold uppercase text-cyber-text tracking-widest text-glow">
          &gt; REPORT A BUG
        </h1>
        <p className="text-xs sm:text-sm text-cyber-subtext font-mono">
          Found something broken, missing, or misaligned? Let us know and get rewarded!
        </p>
      </div>

      <div className="border border-cyber-yellow bg-cyber-yellow/10 p-4 font-mono text-xs flex items-start sm:items-center space-x-3 text-cyber-yellow shadow-cyber-glow">
        <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5 sm:mt-0" />
        <div className="space-y-1">
          <p className="font-bold uppercase tracking-widest">Prerequisite Task</p>
          <p className="text-cyber-subtext">You must be added to the official WDS WhatsApp group for further interviews. Make sure you have joined before submitting your report.</p>
        </div>
      </div>

      {submitError && (
        <div className="border border-cyber-red bg-cyber-red/10 p-4 font-mono text-xs flex items-center space-x-3 text-cyber-red shadow-cyber-glow-red">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Step 1: Your Details */}
        <Card title="1. YOUR DETAILS">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs text-cyber-subtext">
            <div className="space-y-1">
              <label htmlFor="avatarEmoji" className="block text-cyber-text uppercase font-bold">Your Avatar *</label>
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  id="avatarEmoji" 
                  name="avatarEmoji" 
                  value={details.avatarEmoji} 
                  onChange={handleDetailsChange}
                  maxLength={2}
                  className="w-16 bg-cyber-card border border-cyber-darkborder focus:border-cyber-border focus:outline-none p-3 min-h-[48px] text-cyber-text text-xl text-center"
                  required 
                />
                <div className="flex-1 text-[10px] self-center text-cyber-subtext opacity-70">
                  Pick an emoji to represent you on the leaderboard (e.g. 👾, 🦊, ⚡️)
                </div>
              </div>
            </div>
            
            <div className="space-y-1 sm:col-start-1">
              <label htmlFor="name" className="block text-cyber-text uppercase font-bold">Full Name *</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                value={details.name} 
                onChange={handleDetailsChange}
                placeholder="Enter your name" 
                className="w-full bg-cyber-card border border-cyber-darkborder focus:border-cyber-border focus:outline-none p-3 min-h-[48px] text-cyber-text text-xs"
                required 
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="mobileNumber" className="block text-cyber-text uppercase font-bold">Personal Mobile Number *</label>
              <input 
                type="tel" 
                id="mobileNumber" 
                name="mobileNumber" 
                value={details.mobileNumber} 
                onChange={handleDetailsChange}
                placeholder="Enter personal mobile number" 
                className="w-full bg-cyber-card border border-cyber-darkborder focus:border-cyber-border focus:outline-none p-3 min-h-[48px] text-cyber-text text-xs"
                required 
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="branch" className="block text-cyber-text uppercase font-bold">Branch *</label>
              <select 
                id="branch" 
                name="branch" 
                value={details.branch} 
                onChange={handleDetailsChange}
                className="w-full bg-cyber-card border border-cyber-darkborder focus:border-cyber-border focus:outline-none p-3 min-h-[48px] text-cyber-text text-xs"
                required
              >
                <option value="">Select branch</option>
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="section" className="block text-cyber-text uppercase font-bold">Section *</label>
              <select 
                id="section" 
                name="section" 
                value={details.section} 
                onChange={handleDetailsChange}
                className="w-full bg-cyber-card border border-cyber-darkborder focus:border-cyber-border focus:outline-none p-3 min-h-[48px] text-cyber-text text-xs"
                required
              >
                <option value="">Select section</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="Evening">Evening</option>
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="github" className="block text-cyber-text uppercase font-bold font-mono">GitHub Profile (Optional)</label>
              <input 
                type="url" 
                id="github" 
                name="github" 
                value={details.github} 
                onChange={handleDetailsChange}
                placeholder="https://github.com/username" 
                className="w-full bg-cyber-card border border-cyber-darkborder focus:border-cyber-border focus:outline-none p-3 min-h-[48px] text-cyber-text text-xs"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="linkedin" className="block text-cyber-text uppercase font-bold font-mono">LinkedIn Profile (Optional)</label>
              <input 
                type="url" 
                id="linkedin" 
                name="linkedin" 
                value={details.linkedin} 
                onChange={handleDetailsChange}
                placeholder="https://linkedin.com/in/username" 
                className="w-full bg-cyber-card border border-cyber-darkborder focus:border-cyber-border focus:outline-none p-3 min-h-[48px] text-cyber-text text-xs"
              />
            </div>
            <div className="space-y-1 sm:col-span-2 pt-2 border-t border-cyber-darkborder/30">
              <label className="block text-cyber-text uppercase font-bold mb-1">Are you interested in joining Web Development Society (WDS)?</label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input 
                    type="radio" 
                    name="wdsInterest" 
                    value="Yes" 
                    checked={details.wdsInterest === 'Yes'} 
                    onChange={handleDetailsChange} 
                    className="accent-cyber-border cursor-pointer"
                  />
                  <span>Yes, I am interested!</span>
                </label>
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input 
                    type="radio" 
                    name="wdsInterest" 
                    value="No" 
                    checked={details.wdsInterest === 'No'} 
                    onChange={handleDetailsChange} 
                    className="accent-cyber-border cursor-pointer"
                  />
                  <span>No, just reporting.</span>
                </label>
              </div>
            </div>
          </div>
        </Card>

        {/* Step 2: Bug Location */}
        <Card title="2. BUG LOCATION">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs text-cyber-subtext">
            <div className="space-y-1">
              <label htmlFor="pageCategory" className="block text-cyber-text uppercase font-bold">Page Category *</label>
              <select 
                id="pageCategory" 
                name="pageCategory" 
                value={bug.pageCategory} 
                onChange={handleBugChange}
                className="w-full bg-cyber-card border border-cyber-darkborder focus:border-cyber-border focus:outline-none p-3 min-h-[48px] text-cyber-text text-xs"
                required
              >
                <option value="">Select page category</option>
                <option value="Home">Home</option>
                <option value="About MSIT">About MSIT</option>
                <option value="Academics">Academics</option>
                <option value="Departments">Departments</option>
                <option value="Faculty">Faculty</option>
                <option value="Societies">Societies</option>
                <option value="Events">Events</option>
                <option value="Notices">Notices</option>
                <option value="Admissions">Admissions</option>
                <option value="Placements">Placements</option>
                <option value="Student Life">Student Life</option>
                <option value="Contact">Contact</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="pageUrl" className="block text-cyber-text uppercase font-bold">Exact Page URL *</label>
              <input 
                type="url" 
                id="pageUrl" 
                name="pageUrl" 
                value={bug.pageUrl} 
                onChange={handleBugChange}
                placeholder="https://msit.ac.in/..." 
                className="w-full bg-cyber-card border border-cyber-darkborder focus:border-cyber-border focus:outline-none p-3 min-h-[48px] text-cyber-text text-xs"
                required 
              />
            </div>
          </div>
        </Card>

        {/* Step 3: Bug Description */}
        <Card title="3. BUG DESCRIPTION">
          <div className="space-y-4 font-mono text-xs text-cyber-subtext">
            <div className="space-y-1">
              <label htmlFor="description" className="block text-cyber-text uppercase font-bold">What problem did you find? *</label>
              <textarea 
                id="description" 
                name="description" 
                value={bug.description} 
                onChange={handleBugChange}
                placeholder="Describe the issue in detail..." 
                rows={3}
                className="w-full bg-cyber-card border border-cyber-darkborder focus:border-cyber-border focus:outline-none p-3 min-h-[120px] text-cyber-text text-xs font-mono"
                required 
              />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="expectedBehaviour" className="block text-cyber-text uppercase font-bold">What did you expect to happen? *</label>
              <textarea 
                id="expectedBehaviour" 
                name="expectedBehaviour" 
                value={bug.expectedBehaviour} 
                onChange={handleBugChange}
                placeholder="What was the expected behaviour?" 
                rows={2}
                className="w-full bg-cyber-card border border-cyber-darkborder focus:border-cyber-border focus:outline-none p-3 min-h-[120px] text-cyber-text text-xs font-mono"
                required 
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="actualBehaviour" className="block text-cyber-text uppercase font-bold">What actually happened? *</label>
              <textarea 
                id="actualBehaviour" 
                name="actualBehaviour" 
                value={bug.actualBehaviour} 
                onChange={handleBugChange}
                placeholder="What actually occurred when you tested it?" 
                rows={2}
                className="w-full bg-cyber-card border border-cyber-darkborder focus:border-cyber-border focus:outline-none p-3 min-h-[120px] text-cyber-text text-xs font-mono"
                required 
              />
            </div>
          </div>
        </Card>

        {/* Step 4: Evidence & Step 5: Suggested Solution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="4. EVIDENCE">
            <div className="space-y-4 font-mono text-xs text-cyber-subtext">
              <div className="space-y-1">
                <label className="block text-cyber-text uppercase font-bold">Upload Screenshot *</label>
                <div className="border border-dashed border-cyber-darkborder p-4 bg-black/20 text-center relative cursor-pointer hover:border-cyber-border transition-colors">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    required={!screenshot}
                  />
                  {screenshotPreview ? (
                    <div className="space-y-2">
                      <img src={screenshotPreview} alt="Preview" className="max-h-36 mx-auto object-contain border border-cyber-darkborder" />
                      <p className="text-[10px] text-cyber-text truncate">{screenshot?.name}</p>
                    </div>
                  ) : (
                    <div className="space-y-1 py-4">
                      <p className="font-bold text-cyber-text uppercase">Click to upload screenshot</p>
                      <p className="text-[10px]">PNG, JPG, JPEG up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card title="5. SUGGESTED SOLUTION (Optional)">
            <div className="space-y-4 font-mono text-xs text-cyber-subtext">
              <div className="space-y-1">
                <label className="block text-cyber-text uppercase font-bold mb-1">Do you have a suggested solution?</label>
                <div className="flex space-x-4 mb-2">
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input 
                      type="radio" 
                      name="hasSuggestedSolution" 
                      value="Yes" 
                      checked={bug.hasSuggestedSolution === 'Yes'} 
                      onChange={handleBugChange} 
                      className="accent-cyber-border cursor-pointer"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input 
                      type="radio" 
                      name="hasSuggestedSolution" 
                      value="No" 
                      checked={bug.hasSuggestedSolution === 'No'} 
                      onChange={handleBugChange} 
                      className="accent-cyber-border cursor-pointer"
                    />
                    <span>No</span>
                  </label>
                </div>
                
                {bug.hasSuggestedSolution === 'Yes' && (
                  <textarea 
                    id="suggestedSolution" 
                    name="suggestedSolution" 
                    value={bug.suggestedSolution} 
                    onChange={handleBugChange}
                    placeholder="Describe your suggested solution or share code changes..." 
                    rows={4}
                    className="w-full bg-cyber-card border border-cyber-darkborder focus:border-cyber-border focus:outline-none p-3 min-h-[120px] text-cyber-text text-xs font-mono"
                  />
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Step 6: Severity & Submission CTA */}
        <Card title="6. SEVERITY (Your Estimate)">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 font-mono text-xs text-cyber-subtext">
            <div className="flex flex-wrap gap-4">
              {['Minor', 'Moderate', 'Major', 'Critical', 'Not sure'].map((sev) => (
                <label key={sev} className="flex items-center space-x-1.5 cursor-pointer hover:text-cyber-text min-h-[44px]">
                  <input 
                    type="radio" 
                    name="studentSeverity" 
                    value={sev} 
                    checked={bug.studentSeverity === sev} 
                    onChange={handleBugChange} 
                    className="accent-cyber-border cursor-pointer"
                  />
                  <span>{sev}</span>
                </label>
              ))}
            </div>

            <TerminalButton 
              type="submit" 
              variant="primary" 
              className="w-full sm:w-auto px-8 py-4 min-h-[48px] flex items-center justify-center space-x-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>TRANSMITTING...</span>
                </>
              ) : (
                <>
                  <span>SUBMIT BUG REPORT</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </TerminalButton>
          </div>
        </Card>

      </form>
    </div>
  );
}
