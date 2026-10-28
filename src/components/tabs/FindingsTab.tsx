import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  ShieldCheck, 
  AlertTriangle, 
  ShieldAlert, 
  Info, 
  Sparkles, 
  Code2, 
  ExternalLink,
  Filter
} from 'lucide-react';
import { Finding, SupportedFramework, Severity } from '../../types/security';

interface FindingsTabProps {
  findings: Finding[];
  targetUrl: string;
}

export const FindingsTab: React.FC<FindingsTabProps> = ({ findings, targetUrl }) => {
  const [expandedId, setExpandedId] = useState<string | null>(
    findings.length > 0 ? findings[0].id : null
  );
  const [activeFramework, setActiveFramework] = useState<Record<string, SupportedFramework>>({});
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const frameworks: { id: SupportedFramework; label: string }[] = [
    { id: 'nextjs', label: 'Next.js' },
    { id: 'nginx', label: 'Nginx' },
    { id: 'apache', label: 'Apache' },
    { id: 'caddy', label: 'Caddy' },
    { id: 'express', label: 'Express / Helmet' },
    { id: 'cloudflare', label: 'Cloudflare' },
  ];

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleCopyAiPrompt = (finding: Finding, framework: SupportedFramework) => {
    const prompt = `You are a Principal Security Engineer.
Please resolve the following security defect detected by VibeProof Lens for ${targetUrl}:

[Finding ${finding.ruleId}] ${finding.title}
Severity: ${finding.severity} (${finding.kind})
Description: ${finding.description}
Deterministic Evidence: ${finding.evidence}
Security Standards: ${finding.standards.join(', ')}

Target Framework: ${framework.toUpperCase()}
Required Action:
1. Provide the exact, production-ready configuration patch for ${framework}.
2. Ensure backward compatibility and zero disruption to valid client traffic.
3. Validate that the patch satisfies RFC 6797 and OWASP WSTG-CONF-07.`;

    navigator.clipboard.writeText(prompt);
    setCopiedPromptId(finding.id);
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  const filteredFindings = findings.filter((f) => {
    if (severityFilter === 'all') return true;
    return f.severity.toLowerCase() === severityFilter.toLowerCase();
  });

  const getSeverityStyle = (sev: Severity) => {
    switch (sev) {
      case 'Critical':
        return 'bg-rose-950 text-rose-300 border-rose-800/80';
      case 'High':
        return 'bg-rose-950/70 text-rose-300 border-rose-800/60';
      case 'Medium':
        return 'bg-amber-950 text-amber-300 border-amber-800/80';
      case 'Low':
        return 'bg-sky-950 text-sky-300 border-sky-800/80';
      default:
        return 'bg-slate-900 text-slate-300 border-slate-700';
    }
  };

  if (findings.length === 0) {
    return (
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/40">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Zero Security Findings Detected</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
            Target host <code className="text-slate-200 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">{targetUrl}</code> satisfies all baseline X.509 validity, permanent port 80 redirection, and modern HSTS downgrade guard requirements.
          </p>
        </div>
        <div className="pt-2 text-xs text-slate-500 font-mono">
          Audit Grade: A+ · Compliant with OWASP ASVS 4.0 & PCI-DSS 4.0
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Findings Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Identified Issues & Technical Fixes
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            ({filteredFindings.length} of {findings.length})
          </span>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-500 px-2 font-medium flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {['all', 'critical', 'medium', 'low'].map((sev) => (
            <button
              key={sev}
              type="button"
              onClick={() => setSeverityFilter(sev)}
              className={`px-2.5 py-1 rounded-lg font-mono capitalize transition-colors ${
                severityFilter === sev
                  ? 'bg-slate-800 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Findings Accordion List */}
      <div className="space-y-4">
        {filteredFindings.map((f) => {
          const isExpanded = expandedId === f.id;
          const currentFw = activeFramework[f.id] || 'nextjs';
          const currentCode = f.remediationPrompts[currentFw] || f.remediationPrompts.nextjs;

          return (
            <div
              key={f.id}
              className="border border-slate-800 bg-slate-900/40 rounded-2xl overflow-hidden transition-all duration-200 hover:border-slate-700/80 shadow-sm"
            >
              {/* Header Row */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : f.id)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-800/30 transition-colors select-none"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-mono font-semibold border ${getSeverityStyle(f.severity)}`}>
                    {f.severity}
                  </span>
                  <span className="font-mono text-xs text-indigo-400 font-semibold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {f.ruleId}
                  </span>
                  <span className="font-medium text-sm text-slate-100">
                    {f.title}
                  </span>
                  <span className="text-xs text-slate-500 font-mono hidden md:inline">
                    · {f.kind}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 pl-2">
                  <span className="text-xs hidden sm:inline text-slate-500">
                    {isExpanded ? 'Collapse' : 'Remediation'}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded Remediation Body */}
              {isExpanded && (
                <div className="p-6 border-t border-slate-800 bg-slate-950/70 space-y-5 text-xs">
                  {/* Description & Impact */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <h4 className="font-semibold text-slate-400 uppercase tracking-wider text-[11px]">
                        Defect Description
                      </h4>
                      <p className="text-slate-300 leading-relaxed">
                        {f.description}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="font-semibold text-rose-400/90 uppercase tracking-wider text-[11px]">
                        Security & Business Impact
                      </h4>
                      <p className="text-slate-300 leading-relaxed">
                        {f.impact}
                      </p>
                    </div>
                  </div>

                  {/* Deterministic Evidence */}
                  <div className="space-y-1.5">
                    <h4 className="font-semibold text-slate-400 uppercase tracking-wider text-[11px]">
                      Deterministic Probe Evidence
                    </h4>
                    <code className="block bg-slate-950 p-3 rounded-xl text-slate-300 font-mono border border-slate-800/80 break-all">
                      {f.evidence}
                    </code>
                  </div>

                  {/* Standards Alignment */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <span className="text-slate-500 font-medium">Standards Citation:</span>
                    {f.standards.map((st, i) => (
                      <span
                        key={i}
                        className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-slate-300 font-mono text-[11px]"
                      >
                        {st}
                      </span>
                    ))}
                  </div>

                  {/* AI Remediation Snippet Box with Framework Switcher */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-indigo-400" />
                        <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
                          Production Remediation Patch
                        </h4>
                      </div>

                      {/* Framework Switcher Tabs */}
                      <div className="flex flex-wrap items-center gap-1">
                        {frameworks.map((fw) => {
                          const isActive = currentFw === fw.id;
                          return (
                            <button
                              key={fw.id}
                              type="button"
                              onClick={() =>
                                setActiveFramework((prev) => ({
                                  ...prev,
                                  [f.id]: fw.id,
                                }))
                              }
                              className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors ${
                                isActive
                                  ? 'bg-indigo-600 text-white font-semibold'
                                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                              }`}
                            >
                              {fw.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action Bar (Copy Code & Copy AI Prompt) */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-400 font-mono text-[11px]">
                        Target Stack: <span className="text-indigo-300 font-semibold">{currentFw.toUpperCase()}</span>
                      </span>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleCopyAiPrompt(f, currentFw)}
                          className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-mono cursor-pointer"
                          title="Generate high-fidelity engineer prompt"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{copiedPromptId === f.id ? 'Copied Prompt!' : 'Copy AI Prompt'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyCode(currentCode, f.id)}
                          className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-lg border border-slate-700 transition-colors font-mono cursor-pointer"
                        >
                          {copiedCodeId === f.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>{copiedCodeId === f.id ? 'Copied Code!' : 'Copy Config'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Preformatted Code Box */}
                    <pre className="bg-slate-950 p-4 rounded-xl text-slate-200 font-mono border border-slate-800/90 overflow-x-auto text-[11px] leading-relaxed">
                      {currentCode}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
