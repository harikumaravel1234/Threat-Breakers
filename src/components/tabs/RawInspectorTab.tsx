import React, { useState } from 'react';
import { 
  FileText, 
  Copy, 
  Check, 
  Download, 
  Search, 
  Terminal, 
  Code 
} from 'lucide-react';
import { AuditData } from '../../types/security';

interface RawInspectorTabProps {
  data: AuditData;
}

export const RawInspectorTab: React.FC<RawInspectorTabProps> = ({ data }) => {
  const { certificate, rawHeaders, targetUrl } = data;
  const [copiedPem, setCopiedPem] = useState(false);
  const [copiedHeaders, setCopiedHeaders] = useState(false);
  const [headerFilter, setHeaderFilter] = useState('');

  const handleCopyPem = () => {
    navigator.clipboard.writeText(certificate.pemString);
    setCopiedPem(true);
    setTimeout(() => setCopiedPem(false), 2000);
  };

  const handleDownloadCrt = () => {
    const blob = new Blob([certificate.pemString], { type: 'application/x-x509-ca-cert' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${certificate.commonName}.crt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyHeadersJson = () => {
    navigator.clipboard.writeText(JSON.stringify(rawHeaders, null, 2));
    setCopiedHeaders(true);
    setTimeout(() => setCopiedHeaders(false), 2000);
  };

  const headerEntries = Object.entries(rawHeaders).filter(
    ([k, v]) =>
      k.toLowerCase().includes(headerFilter.toLowerCase()) ||
      v.toLowerCase().includes(headerFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Raw HTTP Response Headers Inspector */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
              Port 443 HTTP Response Headers
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={headerFilter}
                onChange={(e) => setHeaderFilter(e.target.value)}
                placeholder="Search headers..."
                className="w-full pl-8 pr-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={handleCopyHeadersJson}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-lg border border-slate-700 transition-colors"
            >
              {copiedHeaders ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedHeaders ? 'Copied JSON' : 'Copy JSON'}</span>
            </button>
          </div>
        </div>

        <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4 font-semibold w-1/3">Header Name</th>
                <th className="py-2.5 px-4 font-semibold">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {headerEntries.map(([key, val], idx) => {
                const isSecurityHeader = [
                  'strict-transport-security',
                  'content-security-policy',
                  'x-frame-options',
                  'x-content-type-options',
                ].includes(key.toLowerCase());

                return (
                  <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-2 px-4 text-slate-300 font-semibold align-top whitespace-nowrap">
                      <span className={isSecurityHeader ? 'text-indigo-400' : ''}>{key}</span>
                    </td>
                    <td className="py-2 px-4 text-slate-400 break-all">
                      <span className={isSecurityHeader ? 'text-slate-200' : ''}>{val}</span>
                    </td>
                  </tr>
                );
              })}
              {headerEntries.length === 0 && (
                <tr>
                  <td colSpan={2} className="py-4 text-center text-slate-500">
                    No headers match "{headerFilter}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raw X.509 PEM Certificate Viewer */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
              Raw X.509 Public Key Certificate (PEM Format)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyPem}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-lg border border-slate-700 transition-colors cursor-pointer"
            >
              {copiedPem ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPem ? 'Copied PEM' : 'Copy PEM'}</span>
            </button>
            <button
              onClick={handleDownloadCrt}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .crt</span>
            </button>
          </div>
        </div>

        <pre className="bg-slate-950 p-4 rounded-xl text-slate-300 font-mono text-[11px] leading-relaxed border border-slate-800 overflow-x-auto selection:bg-indigo-500/30">
          {certificate.pemString}
        </pre>
      </div>

      {/* ASN.1 Decoded Structural Fields Overview */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Code className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            ASN.1 X.509 Structural Extensions
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase">Key Usage (OID: 2.5.29.15)</span>
            <p className="text-slate-200 font-semibold">Digital Signature, Key Encipherment</p>
            <p className="text-slate-400 text-[11px]">Enables TLS ephemeral session key negotiation</p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase">Extended Key Usage (OID: 2.5.29.37)</span>
            <p className="text-slate-200 font-semibold">Server Auth (1.3.6.1.5.5.7.3.1), Client Auth</p>
            <p className="text-slate-400 text-[11px]">TLS Web Server Authentication valid</p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase">Basic Constraints (OID: 2.5.29.19)</span>
            <p className="text-slate-200 font-semibold">IsCA: FALSE, MaxPathLen: None</p>
            <p className="text-slate-400 text-[11px]">Strict leaf entity certificate cannot issue sub-CAs</p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase">CRL Distribution Point</span>
            <p className="text-slate-200 font-semibold truncate">http://crl.r3.lencr.org/s/r3.crl</p>
            <p className="text-slate-400 text-[11px]">Fallback revocation check URI</p>
          </div>
        </div>
      </div>
    </div>
  );
};
