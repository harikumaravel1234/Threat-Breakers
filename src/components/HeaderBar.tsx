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
    <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <a 
        href="#" 
        onClick={(e) => { e.preventDefault(); onNavigateSection('overview'); }}
        className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 group"
      >
        <span className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 group-hover:bg-indigo-500 transition-colors">
          <Shield className="w-4 h-4" />
        </span>
        <span className="font-semibold tracking-tight">VibeProof Lens</span>
      </a>

      {/* Zone 2: Clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
        <button
          onClick={() => onNavigateSection('overview')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
            activeSection === 'overview' ? 'border-indigo-500 text-white' : 'border-transparent'
          }`}
        >
          Certificate & Chain
        </button>
        <button
          onClick={() => onNavigateSection('transport')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
            activeSection === 'transport' ? 'border-indigo-500 text-white' : 'border-transparent'
          }`}
        >
          Transport & Headers
        </button>
        <button
          onClick={() => onNavigateSection('findings')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
            activeSection === 'findings' ? 'border-indigo-500 text-white' : 'border-transparent'
          }`}
        >
          Actionable Findings
        </button>
        <button
          onClick={() => onNavigateSection('compliance')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
            activeSection === 'compliance' ? 'border-indigo-500 text-white' : 'border-transparent'
          }`}
        >
          Compliance Matrix
        </button>
        <button
          onClick={() => onNavigateSection('raw')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
            activeSection === 'raw' ? 'border-indigo-500 text-white' : 'border-transparent'
          }`}
        >
          Raw PEM & Headers
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onExportReport}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-indigo-400" />
          <span>Export Audit</span>
        </button>
      </div>
    </header>
  );
};
