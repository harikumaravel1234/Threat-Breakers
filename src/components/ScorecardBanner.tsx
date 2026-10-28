import React, { useState } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  AlertTriangle, 
  ShieldAlert, 
  RefreshCw, 
  ExternalLink, 
  Copy, 
  Check, 
  SlidersHorizontal 
} from 'lucide-react';
import { AuditData } from '../types/security';

interface ScorecardBannerProps {
  data: AuditData;
  onRetest: () => void;
  isRetesting: boolean;
  onOpenExpirySimulator: () => void;
}

export const ScorecardBanner: React.FC<ScorecardBannerProps> = ({
  data,
  onRetest,
  isRetesting,
  onOpenExpirySimulator,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(data.targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(data.evaluatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  const getStatusConfig = () => {
    switch (data.status) {
      case 'Clear':
        return {
          icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
          label: 'Scorecard Status: Clear',
          badgeBg: 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300',
          gradeBg: 'bg-emerald-950/80 border-emerald-500 text-emerald-300',
        };
      case 'Critical':
        return {
          icon: <ShieldAlert className="w-4 h-4 text-rose-400" />,
          label: 'Scorecard Status: Critical',
          badgeBg: 'bg-rose-950/60 border-rose-500/50 text-rose-300',
          gradeBg: 'bg-rose-950/80 border-rose-500 text-rose-300',
        };
      case 'Needs Fixing':
      default:
        return {
          icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
          label: 'Scorecard Status: Needs Fixing',
          badgeBg: 'bg-amber-950/60 border-amber-500/50 text-amber-300',
          gradeBg: 'bg-amber-950/80 border-amber-500 text-amber-300',
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-slate-800 gap-6">
      {/* Title & Metadata */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1.5 uppercase tracking-wider">
          <span>Layer: Hosting & Domain</span>
          <span className="text-slate-600">/</span>
          <span>Module 5.1: HTTPS & Certificate Safety</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <span className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Lock className="w-6 h-6" />
          </span>
          <span>HTTPS & Certificate Safety</span>
        </h1>
        
        {/* Unboxed Metadata with Typographic Separators */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-2">
          <span className="flex items-center gap-1.5">
            <span className="text-slate-500">Target:</span>
            <code className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-200 font-mono">
              {data.targetUrl}
            </code>
            <button
              onClick={handleCopyUrl}
              title="Copy URL"
              className="p-1 hover:text-white text-slate-500 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <a
              href={data.targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open Target in New Tab"
              className="p-1 hover:text-indigo-400 text-slate-500 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </span>

          <span className="text-slate-700 hidden sm:inline" aria-hidden="true">·</span>
          <span className="font-mono text-slate-400 tabular-nums">IP: {data.ipAddress}</span>

          <span className="text-slate-700 hidden sm:inline" aria-hidden="true">·</span>
          <span className="text-slate-400">Evaluated: <span className="font-mono text-slate-300">{formattedDate}</span></span>
        </div>
      </div>

      {/* Status Badges & Quick Action Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Letter Grade */}
        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1.5">
          <span className="text-xs text-slate-400">Security Grade:</span>
          <span className={`px-2 py-0.5 rounded font-mono font-bold text-sm border ${statusConfig.gradeBg}`}>
            {data.grade}
          </span>
        </div>

        {/* Overall Status Pill with real state */}
        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold ${statusConfig.badgeBg}`}>
          {statusConfig.icon}
          <span>{statusConfig.label}</span>
        </div>

        {/* Simulate Expiry Button */}
        <button
          onClick={onOpenExpirySimulator}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium rounded-xl transition-colors border border-slate-800 cursor-pointer"
          title="Simulate expiration thresholds"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Simulate Expiry</span>
        </button>

        {/* Retest Button */}
        <button
          onClick={onRetest}
          disabled={isRetesting}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900/50 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm shadow-indigo-600/20 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRetesting ? 'animate-spin' : ''}`} />
          <span>{isRetesting ? 'Probing...' : 'Retest'}</span>
        </button>
      </div>
    </div>
  );
};
