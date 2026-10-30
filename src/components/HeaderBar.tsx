import React from 'react';
import { Shield, Download } from 'lucide-react';

interface HeaderBarProps {
  onExportReport: () => void;
  activeSection: string;
  onNavigateSection: (section: string) => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  onExportReport,
  activeSection,
  onNavigateSection,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-[#26374F] bg-[#111C2E]/90 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <a 
        href="#" 
        onClick={(e) => { e.preventDefault(); onNavigateSection('overview'); }}
        className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-[#F8FAFC] whitespace-nowrap shrink-0 group"
      >
        <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] flex items-center justify-center text-white shadow-sm shadow-[#3B82F6]/25 group-hover:from-[#2563EB] group-hover:to-[#0891B2] transition-colors">
          <Shield className="w-4 h-4" />
        </span>
        <span className="font-semibold tracking-tight text-[#F8FAFC]">VibeProof Lens</span>
      </a>

      {/* Zone 2: Clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#94A3B8]">
        <button
          onClick={() => onNavigateSection('overview')}
          className={`hover:text-[#F8FAFC] transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
            activeSection === 'overview' ? 'border-[#06B6D4] text-[#F8FAFC]' : 'border-transparent'
          }`}
        >
          Certificate & Chain
        </button>
        <button
          onClick={() => onNavigateSection('transport')}
          className={`hover:text-[#F8FAFC] transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
            activeSection === 'transport' ? 'border-[#06B6D4] text-[#F8FAFC]' : 'border-transparent'
          }`}
        >
          Transport & Headers
        </button>
        <button
          onClick={() => onNavigateSection('findings')}
          className={`hover:text-[#F8FAFC] transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
            activeSection === 'findings' ? 'border-[#06B6D4] text-[#F8FAFC]' : 'border-transparent'
          }`}
        >
          Actionable Findings
        </button>
        <button
          onClick={() => onNavigateSection('compliance')}
          className={`hover:text-[#F8FAFC] transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
            activeSection === 'compliance' ? 'border-[#06B6D4] text-[#F8FAFC]' : 'border-transparent'
          }`}
        >
          Compliance Matrix
        </button>
        <button
          onClick={() => onNavigateSection('raw')}
          className={`hover:text-[#F8FAFC] transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
            activeSection === 'raw' ? 'border-[#06B6D4] text-[#F8FAFC]' : 'border-transparent'
          }`}
        >
          Raw PEM & Headers
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onExportReport}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-[#F8FAFC] bg-[#162235] hover:bg-[#1B2B42] hover:text-[#06B6D4] border border-[#26374F] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-[#06B6D4]" />
          <span>Export Audit</span>
        </button>
      </div>
    </header>
  );
};
