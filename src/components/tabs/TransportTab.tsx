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
        <div className="bg-[#162235] border border-[#26374F] rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#26374F]">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#06B6D4]" />
              <h3 className="text-sm font-semibold text-[#F8FAFC] uppercase tracking-wider">
                Port 80 (HTTP) Ingress Audit
              </h3>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#0B1220] border border-[#26374F] text-[#94A3B8]">
              Cleartext Port
            </span>
          </div>

          <div className="divide-y divide-[#26374F] text-xs">
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-[#94A3B8]">Plaintext Access Enforcement</span>
              <span className={`font-mono font-medium flex items-center gap-1 ${
                transport.httpRedirect.status === 'Enforced' ? 'text-[#10B981]' : 'text-[#F43F5E]'
              }`}>
                {transport.httpRedirect.status === 'Enforced' ? (
                  <><Check className="w-3.5 h-3.5" /> Blocked & Redirected</>
                ) : (
                  <><ShieldAlert className="w-3.5 h-3.5" /> Plaintext Permitted!</>
                )}
              </span>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <span className="text-[#94A3B8]">HTTP Status Code Returned</span>
              <span className="font-mono text-[#F8FAFC] font-semibold">
                HTTP {transport.httpRedirect.code} {transport.httpRedirect.code === 308 ? 'Permanent Redirect' : transport.httpRedirect.code === 301 ? 'Moved Permanently' : 'OK'}
              </span>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <span className="text-[#94A3B8]">Redirect Destination</span>
              <span className="font-mono text-[#F8FAFC] max-w-[260px] truncate" title={transport.httpRedirect.destination}>
                {transport.httpRedirect.destination}
              </span>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <span className="text-[#94A3B8]">Preserves HTTP Method (POST/PUT)</span>
              <span className="font-mono text-[#94A3B8]">
                {transport.httpRedirect.code === 308 ? 'Yes (308 Strict)' : 'May downgrade to GET (301)'}
              </span>
            </div>
          </div>

          {/* Hop Trace */}
          <div className="pt-2">
            <span className="text-[11px] font-mono text-[#94A3B8] block mb-2">Redirect Hop Resolution:</span>
            <div className="bg-[#0B1220] p-3 rounded-xl border border-[#26374F] space-y-2 text-xs font-mono">
              {transport.httpRedirect.hops.map((hop, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-[#94A3B8] font-mono text-[10px]">HOP 0{index + 1}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    hop.status >= 300 && hop.status < 400 ? 'bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/30' : 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                  }`}>
                    {hop.status}
                  </span>
                  <span className="text-[#F8FAFC] truncate">{hop.url}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Port 443 TLS Ingress */}
        <div className="bg-[#162235] border border-[#26374F] rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#26374F]">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#10B981]" />
              <h3 className="text-sm font-semibold text-[#F8FAFC] uppercase tracking-wider">
                Port 443 (HTTPS) Ingress Audit
              </h3>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981]">
              Encrypted TLS
            </span>
          </div>

          <div className="divide-y divide-[#26374F] text-xs">
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-[#94A3B8]">Negotiated TLS Version</span>
              <span className="font-mono text-[#10B981] font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> {transport.tlsNegotiation.protocol} (Modern)
              </span>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <span className="text-[#94A3B8]">Cipher Suite</span>
              <span className="font-mono text-[#F8FAFC] font-medium">
                {transport.tlsNegotiation.cipherSuite}
              </span>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <span className="text-[#94A3B8]">Perfect Forward Secrecy (PFS)</span>
              <span className="text-[#10B981] flex items-center gap-1 font-mono font-medium">
                <Check className="w-3.5 h-3.5" /> Ephemeral Key Exchange Enabled
              </span>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <span className="text-[#94A3B8]">ALPN Application Protocols</span>
              <span className="font-mono text-[#94A3B8]">
                {transport.tlsNegotiation.alpnProtocols.join(' · ')}
              </span>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <span className="text-[#94A3B8]">SNI (Server Name Indication)</span>
              <span className="text-[#10B981] flex items-center gap-1 font-mono">
                <Check className="w-3.5 h-3.5" /> Supported & Required
              </span>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <span className="text-[#94A3B8]">Session Resumption</span>
              <span className="text-[#94A3B8] font-mono">
                TLS Session Tickets (RFC 5077) Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive HSTS Directives Analyzer & Builder Tool */}
      <div className="bg-[#162235] border border-[#26374F] rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#26374F] gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#06B6D4]" />
              <h3 className="text-sm font-semibold text-[#F8FAFC] uppercase tracking-wider">
                HSTS Policy Validator & Header Builder
              </h3>
            </div>
            <p className="text-xs text-[#94A3B8] mt-1">
              Test and generate bulletproof HTTP Strict Transport Security (RFC 6797) headers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#94A3B8]">Target Current State:</span>
            <span className={`text-xs px-2.5 py-1 rounded font-mono font-semibold border ${
              transport.hsts.status === 'Enforced'
                ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/40'
                : 'bg-[#FACC15]/15 text-[#FACC15] border-[#FACC15]/40'
            }`}>
              {transport.hsts.status === 'Enforced' ? 'HSTS Active' : 'HSTS Missing'}
            </span>
          </div>
        </div>

        {/* Interactive Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Max-Age Selector */}
          <div className="bg-[#0B1220] p-4 rounded-xl border border-[#26374F] space-y-3">
            <label className="text-xs font-semibold text-[#F8FAFC] block">
              1. Max-Age Expiration (Duration)
            </label>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#94A3B8]">Seconds: {builderMaxAge.toLocaleString()}</span>
                <span className="text-[#06B6D4] font-bold">
                  {builderMaxAge === 0 ? '0 (Disable)' :
                   builderMaxAge === 15768000 ? '6 Months' :
                   builderMaxAge === 31536000 ? '1 Year' : '2 Years'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setBuilderMaxAge(15768000)}
                  className={`px-2 py-1 rounded text-[11px] font-mono border transition-colors cursor-pointer ${
                    builderMaxAge === 15768000 ? 'bg-[#3B82F6] text-white border-[#3B82F6]' : 'bg-[#162235] text-[#94A3B8] border-[#26374F] hover:text-[#F8FAFC]'
                  }`}
                >
                  6 Mo
                </button>
                <button
                  type="button"
                  onClick={() => setBuilderMaxAge(31536000)}
                  className={`px-2 py-1 rounded text-[11px] font-mono border transition-colors cursor-pointer ${
                    builderMaxAge === 31536000 ? 'bg-[#3B82F6] text-white border-[#3B82F6]' : 'bg-[#162235] text-[#94A3B8] border-[#26374F] hover:text-[#F8FAFC]'
                  }`}
                >
                  1 Year (Rec)
                </button>
                <button
                  type="button"
                  onClick={() => setBuilderMaxAge(63072000)}
                  className={`px-2 py-1 rounded text-[11px] font-mono border transition-colors cursor-pointer ${
                    builderMaxAge === 63072000 ? 'bg-[#3B82F6] text-white border-[#3B82F6]' : 'bg-[#162235] text-[#94A3B8] border-[#26374F] hover:text-[#F8FAFC]'
                  }`}
                >
                  2 Years
                </button>
              </div>
            </div>
            <p className="text-[11px] text-[#94A3B8]/70 leading-tight">
              Preload list requires at least 18 weeks (10,886,400s). 1 year is industry standard.
            </p>
          </div>

          {/* Subdomains Toggle */}
          <div className="bg-[#0B1220] p-4 rounded-xl border border-[#26374F] flex flex-col justify-between">
            <div>
              <label className="text-xs font-semibold text-[#F8FAFC] block mb-1">
                2. Subdomain Enforcement
              </label>
              <p className="text-[11px] text-[#94A3B8] mb-3">
                Instructs user browsers to apply strict HTTPS to all present and future subdomains (e.g. *.demo.vibeprooflens.dev).
              </p>
            </div>
            <button
              type="button"
              onClick={() => setBuilderSubdomains(!builderSubdomains)}
              className={`w-full py-2 px-3 rounded-lg text-xs font-mono font-medium border flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                builderSubdomains
                  ? 'bg-[#10B981]/15 border-[#10B981]/50 text-[#10B981]'
                  : 'bg-[#162235] border-[#26374F] text-[#94A3B8]'
              }`}
            >
              {builderSubdomains ? <Check className="w-3.5 h-3.5" /> : null}
              <span>includeSubDomains: {builderSubdomains ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* Preload Toggle */}
          <div className="bg-[#0B1220] p-4 rounded-xl border border-[#26374F] flex flex-col justify-between">
            <div>
              <label className="text-xs font-semibold text-[#F8FAFC] block mb-1">
                3. HSTS Browser Preload
              </label>
              <p className="text-[11px] text-[#94A3B8] mb-3">
                Signals consent to hardcode your domain into Chrome, Firefox, Safari, and Edge browser source code binaries.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setBuilderPreload(!builderPreload)}
              className={`w-full py-2 px-3 rounded-lg text-xs font-mono font-medium border flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                builderPreload
                  ? 'bg-[#3B82F6]/15 border-[#3B82F6]/50 text-[#3B82F6]'
                  : 'bg-[#162235] border-[#26374F] text-[#94A3B8]'
              }`}
            >
              {builderPreload ? <Check className="w-3.5 h-3.5" /> : null}
              <span>preload: {builderPreload ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* Output Header Box */}
        <div className="bg-[#0B1220] p-4 rounded-xl border border-[#26374F] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider font-mono">
              Generated Response Header:
            </span>
            <div className="flex items-center gap-3">
              <span className={`text-[11px] font-mono flex items-center gap-1 ${
                isPreloadEligible ? 'text-[#10B981]' : 'text-[#FACC15]'
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
                className="flex items-center gap-1 text-xs text-[#06B6D4] hover:text-[#38BDF8] transition-colors font-mono cursor-pointer"
              >
                {copiedHsts ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedHsts ? 'Copied!' : 'Copy Header'}</span>
              </button>
            </div>
          </div>
          <code className="block bg-[#162235] p-3 rounded-lg text-[#F8FAFC] font-mono text-xs border border-[#26374F] break-all">
            {generatedHstsHeader}
          </code>
        </div>
      </div>
    </div>
  );
};
