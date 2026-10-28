import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Check, X, FileCheck } from 'lucide-react';
import { AuditData } from '../../types/security';

interface ComplianceTabProps {
  data: AuditData;
}

export const ComplianceTab: React.FC<ComplianceTabProps> = ({ data }) => {
  const { compliance, targetUrl, grade } = data;

  const passedCount = compliance.filter((c) => c.status === 'Pass').length;
  const totalCount = compliance.length;
  const isFullyCompliant = passedCount === totalCount;

  return (
    <div className="space-y-6">
      {/* Compliance Overview Banner */}
      <div className={`border rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isFullyCompliant
          ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
          : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl border ${
            isFullyCompliant
              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400'
              : 'bg-amber-950/80 border-amber-500 text-amber-400'
          }`}>
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">
              {isFullyCompliant ? 'Full Regulatory & Transport Compliance' : 'Partial Compliance — Remediation Required'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Target host <span className="font-mono text-slate-300">{targetUrl}</span> satisfies {passedCount} of {totalCount} evaluated regulatory security baseline controls.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
            Rating: <span className="font-bold text-white">{grade}</span> ({Math.round((passedCount / totalCount) * 100)}%)
          </div>
        </div>
      </div>

      {/* Compliance Table */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Framework Requirements Audit
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            Automated Rule Engine Verification
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/90 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Standard & Section</th>
                <th className="py-3 px-4 font-semibold">Requirement Specification</th>
                <th className="py-3 px-4 font-semibold text-center w-28">Status</th>
                <th className="py-3 px-4 font-semibold">Deterministic Findings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 font-mono">
              {compliance.map((item) => (
                <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 px-4 align-top whitespace-nowrap">
                    <span className="text-slate-200 font-semibold block">{item.standard}</span>
                    <span className="text-indigo-400 text-[11px]">{item.section}</span>
                  </td>

                  <td className="py-3.5 px-4 font-sans text-slate-300 max-w-md leading-relaxed align-top">
                    {item.requirement}
                  </td>

                  <td className="py-3.5 px-4 text-center align-top whitespace-nowrap">
                    {item.status === 'Pass' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/80">
                        <Check className="w-3 h-3" /> Pass
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-950 text-amber-300 border border-amber-800/80">
                        <X className="w-3 h-3" /> Fail
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 font-sans text-xs text-slate-400 align-top leading-relaxed">
                    {item.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
