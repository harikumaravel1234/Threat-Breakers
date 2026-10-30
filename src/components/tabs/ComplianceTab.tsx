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
      <div className={`border rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${
        isFullyCompliant
          ? 'bg-[#10B981]/15 border-[#10B981]/40 text-[#10B981]'
          : 'bg-[#FACC15]/15 border-[#FACC15]/40 text-[#FACC15]'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl border ${
            isFullyCompliant
              ? 'bg-[#10B981]/25 border-[#10B981]/50 text-[#10B981]'
              : 'bg-[#FACC15]/25 border-[#FACC15]/50 text-[#FACC15]'
          }`}>
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#F8FAFC]">
              {isFullyCompliant ? 'Full Regulatory & Transport Compliance' : 'Partial Compliance — Remediation Required'}
            </h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Target host <span className="font-mono text-[#F8FAFC]">{targetUrl}</span> satisfies {passedCount} of {totalCount} evaluated regulatory security baseline controls.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#0B1220] border border-[#26374F] text-xs font-mono text-[#94A3B8]">
            Rating: <span className="font-bold text-[#F8FAFC]">{grade}</span> ({Math.round((passedCount / totalCount) * 100)}%)
          </div>
        </div>
      </div>

      {/* Compliance Table */}
      <div className="bg-[#162235] border border-[#26374F] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-[#26374F] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#F8FAFC] uppercase tracking-wider">
            Framework Requirements Audit
          </h3>
          <span className="text-xs text-[#94A3B8] font-mono">
            Automated Rule Engine Verification
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B1220] text-[#94A3B8] font-mono text-[11px] uppercase tracking-wider border-b border-[#26374F]">
              <tr>
                <th className="py-3 px-4 font-semibold">Standard & Section</th>
                <th className="py-3 px-4 font-semibold">Requirement Specification</th>
                <th className="py-3 px-4 font-semibold text-center w-28">Status</th>
                <th className="py-3 px-4 font-semibold">Deterministic Findings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#26374F] font-mono">
              {compliance.map((item) => (
                <tr key={item.id} className="hover:bg-[#1B2B42]/40 transition-colors">
                  <td className="py-3.5 px-4 align-top whitespace-nowrap">
                    <span className="text-[#F8FAFC] font-semibold block">{item.standard}</span>
                    <span className="text-[#06B6D4] text-[11px] font-semibold">{item.section}</span>
                  </td>

                  <td className="py-3.5 px-4 font-sans text-[#F8FAFC] max-w-md leading-relaxed align-top">
                    {item.requirement}
                  </td>

                  <td className="py-3.5 px-4 text-center align-top whitespace-nowrap">
                    {item.status === 'Pass' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/40">
                        <Check className="w-3 h-3" /> Pass
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#F43F5E]/15 text-[#F43F5E] border border-[#F43F5E]/40">
                        <X className="w-3 h-3" /> Fail
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 font-sans text-xs text-[#94A3B8] align-top leading-relaxed">
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
