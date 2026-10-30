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
          icon: <ShieldCheck className="w-4 h-4 text-[#10B981]" />,
          label: 'Scorecard Status: Clear',
          badgeBg: 'bg-[#10B981]/15 border-[#10B981]/40 text-[#10B981]',
          gradeBg: 'bg-[#10B981]/20 border-[#10B981] text-[#10B981]',
        };
      case 'Critical':
        return {
          icon: <ShieldAlert className="w-4 h-4 text-[#F43F5E]" />,
          label: 'Scorecard Status: Critical',
          badgeBg: 'bg-[#F43F5E]/15 border-[#F43F5E]/40 text-[#F43F5E]',
          gradeBg: 'bg-[#F43F5E]/20 border-[#F43F5E] text-[#F43F5E]',
        };
      case 'Needs Fixing':
      default:
        return {
          icon: <AlertTriangle className="w-4 h-4 text-[#FACC15]" />,
          label: 'Scorecard Status: Needs Fixing',
          badgeBg: 'bg-[#FACC15]/15 border-[#FACC15]/40 text-[#FACC15]',
          gradeBg: 'bg-[#FACC15]/20 border-[#FACC15] text-[#FACC15]',
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-[#26374F] gap-6">
      {/* Title & Metadata */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-[#06B6D4] mb-1.5 uppercase tracking-wider font-semibold">
          <span>Layer: Hosting & Domain</span>
          <span className="text-[#26374F]">/</span>
          <span>Module 5.1: HTTPS & Certificate Safety</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F8FAFC] flex items-center gap-2.5">
          <span className="p-1.5 rounded-lg bg-[#06B6D4]/10 border border-[#06B6D4]/25 text-[#06B6D4]">
            <Lock className="w-6 h-6" />
          </span>
          <span>HTTPS & Certificate Safety</span>
        </h1>
        
        {/* Unboxed Metadata with Typographic Separators */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#94A3B8] mt-2">
          <span className="flex items-center gap-1.5">
            <span className="text-[#94A3B8]">Target:</span>
            <code className="bg-[#0B1220] border border-[#26374F] px-2 py-0.5 rounded text-[#F8FAFC] font-mono">
              {data.targetUrl}
            </code>
            <button
              onClick={handleCopyUrl}
              title="Copy URL"
              className="p-1 hover:text-[#F8FAFC] text-[#94A3B8] transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <a
              href={data.targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open Target in New Tab"
              className="p-1 hover:text-[#06B6D4] text-[#94A3B8] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </span>

          <span className="text-[#26374F] hidden sm:inline" aria-hidden="true">·</span>
          <span className="font-mono text-[#94A3B8] tabular-nums">IP: {data.ipAddress}</span>

          <span className="text-[#26374F] hidden sm:inline" aria-hidden="true">·</span>
          <span className="text-[#94A3B8]">Evaluated: <span className="font-mono text-[#F8FAFC]">{formattedDate}</span></span>
        </div>
      </div>

      {/* Status Badges & Quick Action Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Letter Grade */}
        <div className="flex items-center gap-2 bg-[#162235] border border-[#26374F] rounded-xl px-3 py-1.5 shadow-sm">
          <span className="text-xs text-[#94A3B8]">Security Grade:</span>
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
          className="flex items-center gap-1.5 px-3 py-2 bg-[#162235] hover:bg-[#1B2B42] text-[#F8FAFC] text-xs font-medium rounded-xl transition-colors border border-[#26374F] cursor-pointer shadow-sm"
          title="Simulate expiration thresholds"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#06B6D4]" />
          <span className="hidden sm:inline">Simulate Expiry</span>
        </button>

        {/* Retest Button */}
        <button
          onClick={onRetest}
          disabled={isRetesting}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#3B82F6] hover:bg-[#2563EB] disabled:bg-[#1B2B42] text-[#F8FAFC] text-xs font-semibold rounded-xl transition-colors shadow-sm shadow-[#3B82F6]/25 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRetesting ? 'animate-spin' : ''}`} />
          <span>{isRetesting ? 'Probing...' : 'Retest'}</span>
        </button>
      </div>
    </div>
  );
};
