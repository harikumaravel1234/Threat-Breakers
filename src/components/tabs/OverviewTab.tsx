import React, { useState } from 'react';
import { 
  Check, 
  Copy, 
  ShieldCheck, 
  AlertTriangle, 
  Layers, 
  Key, 
  Fingerprint, 
  Search, 
  CheckCircle2, 
  XCircle,
  ExternalLink 
} from 'lucide-react';
import { AuditData } from '../../types/security';

interface OverviewTabProps {
  data: AuditData;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ data }) => {
  const { certificate } = data;
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [sanFilter, setSanFilter] = useState('');

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredSans = certificate.san.filter((s) =>
    s.toLowerCase().includes(sanFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Visual Certificate Chain Tree */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
              X.509 Certificate Chain Hierarchy
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            3-Tier Trust Anchor Path
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {/* Node 1: Root CA */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between relative group hover:border-slate-700 transition-colors">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-400 font-mono text-[11px]">LEVEL 0 · ROOT CA</span>
                <span className="text-emerald-400 text-xs flex items-center gap-1 font-mono">
                  <Check className="w-3 h-3" /> Built-in Trust
                </span>
              </div>
              <p className="text-sm font-semibold text-white truncate">
                {certificate.issuerOrg || 'Internet Security Research Group'}
              </p>
              <p className="text-xs text-slate-400 mt-1 font-mono text-[11px]">
                ISRG Root X1 / Mozilla NSS
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
              Self-Signed Root Anchor · RSA 4096
            </div>
          </div>

          {/* Node 2: Intermediate CA */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between relative group hover:border-slate-700 transition-colors">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-400 font-mono text-[11px]">LEVEL 1 · INTERMEDIATE CA</span>
                <span className="text-emerald-400 text-xs flex items-center gap-1 font-mono">
                  <Check className="w-3 h-3" /> Signed by Root
                </span>
              </div>
              <p className="text-sm font-semibold text-white truncate">
                {certificate.issuer}
              </p>
              <p className="text-xs text-slate-400 mt-1 font-mono text-[11px]">
                Cross-signed by ISRG Root X1
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
              Intermediate Signer · SHA256withRSA
            </div>
          </div>

          {/* Node 3: Leaf Server Certificate */}
          <div className={`bg-slate-950/80 border rounded-xl p-4 flex flex-col justify-between relative group transition-colors ${
            certificate.status === 'Valid' ? 'border-indigo-500/50' : 'border-rose-500/50'
          }`}>
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-indigo-400 font-mono text-[11px]">LEVEL 2 · LEAF CERTIFICATE</span>
                <span className={`text-xs flex items-center gap-1 font-mono ${
                  certificate.status === 'Valid' ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {certificate.status === 'Valid' ? (
                    <><Check className="w-3 h-3" /> Active ({certificate.daysRemaining}d)</>
                  ) : (
                    <><AlertTriangle className="w-3 h-3" /> {certificate.status}</>
                  )}
                </span>
              </div>
              <p className="text-sm font-semibold text-white truncate font-mono">
                {certificate.commonName}
              </p>
              <p className="text-xs text-slate-400 mt-1 font-mono text-[11px]">
                {certificate.publicKeyAlgorithm}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 font-mono flex items-center justify-between">
              <span>Serial: {certificate.serialNumber.slice(0, 14)}...</span>
              <span className="text-indigo-400">Target</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Profile & Cryptographic Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Certificate Specifications */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
              X.509 Certificate Profile
            </h3>
            <span className="text-xs font-mono text-slate-500">RFC 5280</span>
          </div>

          <div className="divide-y divide-slate-800/80 text-xs">
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-400">Common Name (CN)</span>
              <span className="font-mono text-slate-200 font-medium">{certificate.commonName}</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-400">Issuer CA</span>
              <span className="font-mono text-slate-200 text-right">{certificate.issuer}</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-400">Issuer Organization</span>
              <span className="font-mono text-slate-300">{certificate.issuerOrg || 'Verified CA'}</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-400">Trust Chain Status</span>
              <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                <Check className="w-3.5 h-3.5" /> Validated by Public CA
              </span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-400">Valid From (Activation)</span>
              <span className="font-mono text-slate-300 tabular-nums">
                {new Date(certificate.validFrom).toUTCString()}
              </span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-400">Valid To (Expiration)</span>
              <span className="font-mono text-slate-300 tabular-nums">
                {new Date(certificate.validTo).toUTCString()}
              </span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-400">Days Remaining</span>
              <span className={`font-mono font-medium tabular-nums ${
                certificate.daysRemaining < 14 ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {certificate.daysRemaining} days (Renewal recommended &lt; 30d)
              </span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-400">OCSP Stapling Status</span>
              <span className={`flex items-center gap-1 font-mono ${
                certificate.ocspStapled ? 'text-emerald-400' : 'text-slate-400'
              }`}>
                {certificate.ocspStapled ? (
                  <><CheckCircle2 className="w-3.5 h-3.5" /> Stapled & Verified</>
                ) : (
                  <><XCircle className="w-3.5 h-3.5 text-slate-500" /> Not Stapled (Query On-Demand)</>
                )}
              </span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-400">Certificate Transparency (CT)</span>
              <span className="text-slate-200 font-mono">
                {certificate.sctCount} SCT Log Proofs Embedded
              </span>
            </div>
          </div>
        </div>

        {/* Cryptographic Parameters & Fingerprints */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-400" />
              Cryptographic Parameters
            </h3>
            <span className="text-xs font-mono text-slate-500">Key Material</span>
          </div>

          <div className="divide-y divide-slate-800/80 text-xs">
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-400">Public Key Algorithm</span>
              <span className="font-mono text-slate-200 font-medium">{certificate.publicKeyAlgorithm}</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-400">Key Bit Strength</span>
              <span className="font-mono text-slate-200">{certificate.keySizeBits} bits</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-400">Signature Digest Algorithm</span>
              <span className="font-mono text-slate-200">{certificate.signatureAlgorithm}</span>
            </div>
            <div className="py-3 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Fingerprint className="w-3.5 h-3.5 text-indigo-400" /> Serial Number
                </span>
                <button
                  onClick={() => handleCopy(certificate.serialNumber, 'serial')}
                  className="text-slate-500 hover:text-white flex items-center gap-1 font-mono text-[11px]"
                >
                  {copiedKey === 'serial' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'serial' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <code className="bg-slate-950 p-2 rounded text-slate-300 font-mono text-[11px] break-all border border-slate-800">
                {certificate.serialNumber}
              </code>
            </div>
            <div className="py-3 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Fingerprint className="w-3.5 h-3.5 text-cyan-400" /> SHA-256 Fingerprint
                </span>
                <button
                  onClick={() => handleCopy(certificate.fingerprintSha256, 'sha256')}
                  className="text-slate-500 hover:text-white flex items-center gap-1 font-mono text-[11px]"
                >
                  {copiedKey === 'sha256' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'sha256' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <code className="bg-slate-950 p-2 rounded text-slate-300 font-mono text-[11px] break-all border border-slate-800">
                {certificate.fingerprintSha256}
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Subject Alternative Names (SAN) Explorer */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
              Subject Alternative Names (SAN) Coverage
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Identities and hostnames authorized by this X.509 certificate ({certificate.san.length} total)
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={sanFilter}
              onChange={(e) => setSanFilter(e.target.value)}
              placeholder="Filter SAN domains..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {filteredSans.map((san, idx) => (
            <div
              key={idx}
              className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 flex items-center gap-2 group transition-colors"
            >
              <span>DNS:{san}</span>
              <button
                onClick={() => handleCopy(san, `san-${idx}`)}
                className="text-slate-600 group-hover:text-slate-300 transition-colors"
                title="Copy domain"
              >
                {copiedKey === `san-${idx}` ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          ))}
          {filteredSans.length === 0 && (
            <span className="text-xs text-slate-500 font-mono py-2">
              No SAN records matching "{sanFilter}"
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
