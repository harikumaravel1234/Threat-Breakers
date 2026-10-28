import React, { useState } from 'react';
import { Globe, Search, RefreshCw, CheckCircle2, Server, KeyRound, ShieldAlert } from 'lucide-react';

interface TargetScanBarProps {
  currentDomain: string;
  onScanDomain: (domain: string) => void;
  isScanning: boolean;
  scanProgress: { step: number; label: string };
}

export const TargetScanBar: React.FC<TargetScanBarProps> = ({
  currentDomain,
  onScanDomain,
  isScanning,
  scanProgress,
}) => {
  const [inputValue, setInputValue] = useState(currentDomain);

  const presets = [
    { label: 'Demo Target', domain: 'demo.vibeprooflens.dev', tag: 'Needs Fixing' },
    { label: 'Hardened A+', domain: 'vault.fintech-api.cloud', tag: 'Compliant' },
    { label: 'Expiring Soon', domain: 'legacy-billing.internal.org', tag: 'Critical' },
    { label: 'Google Root', domain: 'google.com', tag: 'TLS 1.3' },
    { label: 'GitHub Cloud', domain: 'github.com', tag: 'HSTS Preloaded' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onScanDomain(inputValue.trim());
    }
  };

  const handlePresetSelect = (domain: string) => {
    setInputValue(domain);
    onScanDomain(domain);
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl shadow-black/20">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Globe className="w-4 h-4 text-indigo-400" />
          </div>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter hostname or URL (e.g. demo.vibeprooflens.dev, github.com)"
            disabled={isScanning}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 font-mono transition-all disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={isScanning}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900/60 text-white font-medium text-sm rounded-xl transition-all shadow-md shadow-indigo-600/20 whitespace-nowrap cursor-pointer shrink-0"
        >
          {isScanning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>Inspecting TLS...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Inspect Target</span>
            </>
          )}
        </button>
      </form>

      {/* Preset targets */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
        <span className="text-slate-500 font-medium">Quick Presets:</span>
        {presets.map((p) => {
          const isActive = currentDomain === p.domain;
          return (
            <button
              key={p.domain}
              type="button"
              onClick={() => handlePresetSelect(p.domain)}
              disabled={isScanning}
              className={`px-2.5 py-1 rounded-lg border text-xs font-mono transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-indigo-950/60 border-indigo-500/60 text-indigo-200'
                  : 'bg-slate-950/80 hover:bg-slate-800/80 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <span>{p.domain}</span>
              <span className={`text-[10px] ${
                p.tag === 'Critical' ? 'text-rose-400' :
                p.tag === 'Needs Fixing' ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                · {p.tag}
              </span>
            </button>
          );
        })}
      </div>

      {/* Scan in Progress Telemetry Bar */}
      {isScanning && (
        <div className="pt-2 border-t border-slate-800/80 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="flex items-center gap-2 text-indigo-400 font-mono">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{scanProgress.label}</span>
            </span>
            <span className="font-mono text-slate-400">{scanProgress.step} of 4 checks</span>
          </div>
          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 h-full transition-all duration-300"
              style={{ width: `${(scanProgress.step / 4) * 100}%` }}
            />
          </div>
          <div className="grid grid-cols-4 gap-2 mt-2 text-[11px] text-slate-500 font-mono">
            <span className={scanProgress.step >= 1 ? 'text-indigo-300 flex items-center gap-1' : ''}>
              1. DNS & Port 80
            </span>
            <span className={scanProgress.step >= 2 ? 'text-indigo-300 flex items-center gap-1' : ''}>
              2. TLS Handshake
            </span>
            <span className={scanProgress.step >= 3 ? 'text-indigo-300 flex items-center gap-1' : ''}>
              3. X.509 Chain
            </span>
            <span className={scanProgress.step >= 4 ? 'text-indigo-300 flex items-center gap-1' : ''}>
              4. Downgrade Guard
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
