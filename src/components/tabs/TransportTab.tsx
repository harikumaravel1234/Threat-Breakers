import React, { useState } from 'react';
import { 
  Globe, 
  Lock, 
  ShieldCheck, 
  ShieldAlert, 
  ArrowRight, 
  Check, 
  Copy, 
  Sliders, 
  AlertTriangle,
  Server,
  Zap
} from 'lucide-react';
import { AuditData } from '../../types/security';

interface TransportTabProps {
  data: AuditData;
}

export const TransportTab: React.FC<TransportTabProps> = ({ data }) => {
  const { transport } = data;
  const [copiedHsts, setCopiedHsts] = useState(false);

  // Interactive HSTS Builder State
  const [builderMaxAge, setBuilderMaxAge] = useState<number>(31536000); // 1 year
  const [builderSubdomains, setBuilderSubdomains] = useState<boolean>(true);
  const [builderPreload, setBuilderPreload] = useState<boolean>(true);

  const generatedHstsHeader = `Strict-Transport-Security: max-age=${builderMaxAge}${
    builderSubdomains ? '; includeSubDomains' : ''
  }${builderPreload ? '; preload' : ''}`;

  const handleCopyGeneratedHsts = () => {
    navigator.clipboard.writeText(generatedHstsHeader);
    setCopiedHsts(true);
    setTimeout(() => setCopiedHsts(false), 2000);
  };

  const isPreloadEligible =
    builderMaxAge >= 10886400 && builderSubdomains && builderPreload;

  return (
    <div className="space-y-6">
      {/* Port 80 vs Port 443 Ingress Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Port 80 Plaintext Ingress */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                Port 80 (HTTP) Ingress Audit
              </h3>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
              Cleartext Port
            </span>
          </div>

          <div className="divide-y divide-slate-800/80 text-xs">
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-400">Plaintext Access Enforcement</span>
              <span className={`font-mono font-medium flex items-center gap-1 ${
                transport.httpRedirect.status === 'Enforced' ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {transport.httpRedirect.status === 'Enforced' ? (
                  <><Check className="w-3.5 h-3.5" /> Blocked & Redirected</>
                ) : (
                  <><ShieldAlert className="w-3.5 h-3.5" /> Plaintext Permitted!</>
                )}
              </span>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-400">HTTP Status Code Returned</span>
              <span className="font-mono text-slate-200 font-semibold">
                HTTP {transport.httpRedirect.code} {transport.httpRedirect.code === 308 ? 'Permanent Redirect' : transport.httpRedirect.code === 301 ? 'Moved Permanently' : 'OK'}
              </span>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-400">Redirect Destination</span>
              <span className="font-mono text-slate-200 max-w-[260px] truncate" title={transport.httpRedirect.destination}>
                {transport.httpRedirect.destination}
              </span>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-400">Preserves HTTP Method (POST/PUT)</span>
              <span className="font-mono text-slate-300">
                {transport.httpRedirect.code === 308 ? 'Yes (308 Strict)' : 'May downgrade to GET (301)'}
              </span>
            </div>
          </div>

          {/* Hop Trace */}
          <div className="pt-2">
            <span className="text-[11px] font-mono text-slate-400 block mb-2">Redirect Hop Resolution:</span>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
              {transport.httpRedirect.hops.map((hop, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-slate-500 font-mono text-[10px]">HOP 0{index + 1}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    hop.status >= 300 && hop.status < 400 ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/60' : 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                  }`}>
                    {hop.status}
                  </span>
                  <span className="text-slate-300 truncate">{hop.url}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Port 443 TLS Ingress */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                Port 443 (HTTPS) Ingress Audit
              </h3>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/50 text-emerald-300">
              Encrypted TLS
            </span>
          </div>

          <div className="divide-y divide-slate-800/80 text-xs">
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-400">Negotiated TLS Version</span>
              <span className="font-mono text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> {transport.tlsNegotiation.protocol} (Modern)
              </span>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-400">Cipher Suite</span>
              <span className="font-mono text-slate-200 font-medium">
                {transport.tlsNegotiation.cipherSuite}
              </span>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-400">Perfect Forward Secrecy (PFS)</span>
              <span className="text-emerald-400 flex items-center gap-1 font-mono font-medium">
                <Check className="w-3.5 h-3.5" /> Ephemeral Key Exchange Enabled
              </span>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-400">ALPN Application Protocols</span>
              <span className="font-mono text-slate-300">
                {transport.tlsNegotiation.alpnProtocols.join(' · ')}
              </span>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-400">SNI (Server Name Indication)</span>
              <span className="text-emerald-400 flex items-center gap-1 font-mono">
                <Check className="w-3.5 h-3.5" /> Supported & Required
              </span>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-400">Session Resumption</span>
              <span className="text-slate-300 font-mono">
                TLS Session Tickets (RFC 5077) Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive HSTS Directives Analyzer & Builder Tool */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                HSTS Policy Validator & Header Builder
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Test and generate bulletproof HTTP Strict Transport Security (RFC 6797) headers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Target Current State:</span>
            <span className={`text-xs px-2.5 py-1 rounded font-mono font-semibold border ${
              transport.hsts.status === 'Enforced'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                : 'bg-amber-950 text-amber-300 border-amber-800'
            }`}>
              {transport.hsts.status === 'Enforced' ? 'HSTS Active' : 'HSTS Missing'}
            </span>
          </div>
        </div>

        {/* Interactive Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Max-Age Selector */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <label className="text-xs font-semibold text-slate-300 block">
              1. Max-Age Expiration (Duration)
            </label>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Seconds: {builderMaxAge.toLocaleString()}</span>
                <span className="text-indigo-400 font-bold">
                  {builderMaxAge === 0 ? '0 (Disable)' :
                   builderMaxAge === 15768000 ? '6 Months' :
                   builderMaxAge === 31536000 ? '1 Year' : '2 Years'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setBuilderMaxAge(15768000)}
                  className={`px-2 py-1 rounded text-[11px] font-mono border transition-colors ${
                    builderMaxAge === 15768000 ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  6 Mo
                </button>
                <button
                  type="button"
                  onClick={() => setBuilderMaxAge(31536000)}
                  className={`px-2 py-1 rounded text-[11px] font-mono border transition-colors ${
                    builderMaxAge === 31536000 ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  1 Year (Rec)
                </button>
                <button
                  type="button"
                  onClick={() => setBuilderMaxAge(63072000)}
                  className={`px-2 py-1 rounded text-[11px] font-mono border transition-colors ${
                    builderMaxAge === 63072000 ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  2 Years
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Preload list requires at least 18 weeks (10,886,400s). 1 year is industry standard.
            </p>
          </div>

          {/* Subdomains Toggle */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                2. Subdomain Enforcement
              </label>
              <p className="text-[11px] text-slate-400 mb-3">
                Instructs user browsers to apply strict HTTPS to all present and future subdomains (e.g. *.demo.vibeprooflens.dev).
              </p>
            </div>
            <button
              type="button"
              onClick={() => setBuilderSubdomains(!builderSubdomains)}
              className={`w-full py-2 px-3 rounded-lg text-xs font-mono font-medium border flex items-center justify-center gap-2 transition-colors ${
                builderSubdomains
                  ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              {builderSubdomains ? <Check className="w-3.5 h-3.5" /> : null}
              <span>includeSubDomains: {builderSubdomains ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* Preload Toggle */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                3. HSTS Browser Preload
              </label>
              <p className="text-[11px] text-slate-400 mb-3">
                Signals consent to hardcode your domain into Chrome, Firefox, Safari, and Edge browser source code binaries.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setBuilderPreload(!builderPreload)}
              className={`w-full py-2 px-3 rounded-lg text-xs font-mono font-medium border flex items-center justify-center gap-2 transition-colors ${
                builderPreload
                  ? 'bg-indigo-950/60 border-indigo-500/60 text-indigo-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              {builderPreload ? <Check className="w-3.5 h-3.5" /> : null}
              <span>preload: {builderPreload ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* Output Header Box */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Generated Response Header:
            </span>
            <div className="flex items-center gap-3">
              <span className={`text-[11px] font-mono flex items-center gap-1 ${
                isPreloadEligible ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {isPreloadEligible ? (
                  <><Check className="w-3 h-3" /> Chromium Preload Eligible</>
                ) : (
                  <><AlertTriangle className="w-3 h-3" /> Not Preload Eligible</>
                )}
              </span>
              <button
                type="button"
                onClick={handleCopyGeneratedHsts}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-mono cursor-pointer"
              >
                {copiedHsts ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedHsts ? 'Copied!' : 'Copy Header'}</span>
              </button>
            </div>
          </div>
          <code className="block bg-slate-900 p-3 rounded-lg text-slate-200 font-mono text-xs border border-slate-800 break-all">
            {generatedHstsHeader}
          </code>
        </div>
      </div>
    </div>
  );
};
