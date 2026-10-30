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
      <div className="bg-[#162235] border border-[#26374F] rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#26374F]">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#06B6D4]" />
            <h3 className="text-sm font-semibold text-[#F8FAFC] uppercase tracking-wider">
              Port 443 HTTP Response Headers
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="text"
                value={headerFilter}
                onChange={(e) => setHeaderFilter(e.target.value)}
                placeholder="Search headers..."
                className="w-full pl-8 pr-2.5 py-1 bg-[#0B1220] border border-[#26374F] rounded-lg text-xs font-mono text-[#F8FAFC] placeholder:text-[#94A3B8]/70 focus:outline-none focus:border-[#3B82F6]"
              />
            </div>

            <button
              onClick={handleCopyHeadersJson}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#0B1220] hover:bg-[#1B2B42] text-[#F8FAFC] hover:text-[#06B6D4] text-xs font-mono rounded-lg border border-[#26374F] transition-colors cursor-pointer"
            >
              {copiedHeaders ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3" />}
              <span>{copiedHeaders ? 'Copied JSON' : 'Copy JSON'}</span>
            </button>
          </div>
        </div>

        <div className="bg-[#0B1220] rounded-xl border border-[#26374F] overflow-hidden">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#111C2E] border-b border-[#26374F] text-[#94A3B8] text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4 font-semibold w-1/3">Header Name</th>
                <th className="py-2.5 px-4 font-semibold">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#26374F]">
              {headerEntries.map(([key, val], idx) => {
                const isSecurityHeader = [
                  'strict-transport-security',
                  'content-security-policy',
                  'x-frame-options',
                  'x-content-type-options',
                ].includes(key.toLowerCase());

                return (
                  <tr key={idx} className="hover:bg-[#1B2B42]/40 transition-colors">
                    <td className="py-2 px-4 text-[#F8FAFC] font-semibold align-top whitespace-nowrap">
                      <span className={isSecurityHeader ? 'text-[#06B6D4]' : 'text-[#F8FAFC]'}>{key}</span>
                    </td>
                    <td className="py-2 px-4 text-[#94A3B8] break-all">
                      <span className={isSecurityHeader ? 'text-[#F8FAFC]' : ''}>{val}</span>
                    </td>
                  </tr>
                );
              })}
              {headerEntries.length === 0 && (
                <tr>
                  <td colSpan={2} className="py-4 text-center text-[#94A3B8]">
                    No headers match "{headerFilter}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raw X.509 PEM Certificate Viewer */}
      <div className="bg-[#162235] border border-[#26374F] rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#26374F]">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#10B981]" />
            <h3 className="text-sm font-semibold text-[#F8FAFC] uppercase tracking-wider">
              Raw X.509 Public Key Certificate (PEM Format)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyPem}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0B1220] hover:bg-[#1B2B42] text-[#F8FAFC] hover:text-[#06B6D4] text-xs font-mono rounded-lg border border-[#26374F] transition-colors cursor-pointer"
            >
              {copiedPem ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPem ? 'Copied PEM' : 'Copy PEM'}</span>
            </button>
            <button
              onClick={handleDownloadCrt}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3B82F6] hover:bg-[#2563EB] text-[#F8FAFC] text-xs font-mono rounded-lg transition-colors cursor-pointer shadow-sm shadow-[#3B82F6]/25"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .crt</span>
            </button>
          </div>
        </div>

        <pre className="bg-[#0B1220] p-4 rounded-xl text-[#F8FAFC] font-mono text-[11px] leading-relaxed border border-[#26374F] overflow-x-auto selection:bg-[#06B6D4]/30 selection:text-[#F8FAFC]">
          {certificate.pemString}
        </pre>
      </div>

      {/* ASN.1 Decoded Structural Fields Overview */}
      <div className="bg-[#162235] border border-[#26374F] rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 pb-2 border-b border-[#26374F]">
          <Code className="w-4 h-4 text-[#06B6D4]" />
          <h3 className="text-sm font-semibold text-[#F8FAFC] uppercase tracking-wider">
            ASN.1 X.509 Structural Extensions
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-[#0B1220] p-3.5 rounded-xl border border-[#26374F] space-y-1">
            <span className="text-[#94A3B8] text-[10px] uppercase">Key Usage (OID: 2.5.29.15)</span>
            <p className="text-[#F8FAFC] font-semibold">Digital Signature, Key Encipherment</p>
            <p className="text-[#94A3B8] text-[11px]">Enables TLS ephemeral session key negotiation</p>
          </div>

          <div className="bg-[#0B1220] p-3.5 rounded-xl border border-[#26374F] space-y-1">
            <span className="text-[#94A3B8] text-[10px] uppercase">Extended Key Usage (OID: 2.5.29.37)</span>
            <p className="text-[#F8FAFC] font-semibold">Server Auth (1.3.6.1.5.5.7.3.1), Client Auth</p>
            <p className="text-[#94A3B8] text-[11px]">TLS Web Server Authentication valid</p>
          </div>

          <div className="bg-[#0B1220] p-3.5 rounded-xl border border-[#26374F] space-y-1">
            <span className="text-[#94A3B8] text-[10px] uppercase">Basic Constraints (OID: 2.5.29.19)</span>
            <p className="text-[#F8FAFC] font-semibold">IsCA: FALSE, MaxPathLen: None</p>
            <p className="text-[#94A3B8] text-[11px]">Strict leaf entity certificate cannot issue sub-CAs</p>
          </div>

          <div className="bg-[#0B1220] p-3.5 rounded-xl border border-[#26374F] space-y-1">
            <span className="text-[#94A3B8] text-[10px] uppercase">CRL Distribution Point</span>
            <p className="text-[#F8FAFC] font-semibold truncate">http://crl.r3.lencr.org/s/r3.crl</p>
            <p className="text-[#94A3B8] text-[11px]">Fallback revocation check URI</p>
          </div>
        </div>
      </div>
    </div>
  );
};
