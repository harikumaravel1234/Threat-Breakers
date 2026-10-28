import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Globe, 
  Clock, 
  ArrowRight, 
  Cpu, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { AuditData } from '../types/security';

interface SummaryCardsProps {
  data: AuditData;
  onNavigateToTab: (tab: string) => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  data,
  onNavigateToTab,
}) => {
  const { certificate, transport } = data;

  // Expiry progress calculation (standard 90 days cert lifetime)
  const daysTotal = 90;
  const daysRemaining = Math.max(0, certificate.daysRemaining);
  const percentRemaining = Math.min(100, Math.max(0, (daysRemaining / daysTotal) * 100));

  const isExpiringCritical = certificate.daysRemaining <= 7;
  const isExpiringWarning = certificate.daysRemaining <= 30 && certificate.daysRemaining > 7;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Certificate Validity Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700/80 transition-colors shadow-sm">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <span className="flex items-center gap-1.5 font-semibold text-slate-300">
              {certificate.status === 'Valid' ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-rose-400" />
              )}
              Certificate Validity
            </span>
            <span className={`text-[11px] font-mono font-medium ${
              certificate.status === 'Valid' ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {certificate.status === 'Valid' ? 'TRUSTED CA' : certificate.status.toUpperCase()}
            </span>
          </div>

          <p className="text-base font-semibold text-white truncate font-mono" title={certificate.subject}>
            {certificate.subject}
          </p>
          <p className="text-xs text-slate-400 mt-1 truncate" title={certificate.issuer}>
            Issued by: <span className="text-slate-300">{certificate.issuer}</span>
          </p>
        </div>

        <div className="mt-5 pt-3.5 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" /> Expiry Window
            </span>
            <span className={`font-mono font-medium tabular-nums ${
              isExpiringCritical ? 'text-rose-400' :
              isExpiringWarning ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {certificate.daysRemaining <= 0 ? 'Expired' : `${certificate.daysRemaining} days left`}
            </span>
          </div>
          {/* Visual progress bar */}
          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800/60">
            <div
              className={`h-full transition-all duration-500 ${
                isExpiringCritical ? 'bg-rose-500' :
                isExpiringWarning ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${percentRemaining}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. HTTP-to-HTTPS Redirection Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700/80 transition-colors shadow-sm">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <span className="flex items-center gap-1.5 font-semibold text-slate-300">
              <Globe className="w-4 h-4 text-indigo-400" /> Port 80 Ingress
            </span>
            <span className="text-[11px] font-mono text-indigo-300 font-medium">
              STATUS {transport.httpRedirect.code}
            </span>
          </div>

          <p className="text-base font-semibold text-white flex items-center gap-2">
            <span>{transport.httpRedirect.status}</span>
            {transport.httpRedirect.status === 'Enforced' ? (
              <span className="text-xs font-normal text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Enforced
              </span>
            ) : (
              <span className="text-xs font-normal text-rose-400 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Cleartext Ingress
              </span>
            )}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {transport.httpRedirect.status === 'Enforced'
              ? 'Cleartext HTTP permanently redirected to TLS'
              : 'Plain HTTP allowed without TLS redirect!'}
          </p>
        </div>

        <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400 truncate max-w-[170px]" title={transport.httpRedirect.destination}>
            → <code className="font-mono text-slate-300">{transport.httpRedirect.destination}</code>
          </span>
          <button
            onClick={() => onNavigateToTab('transport')}
            className="text-indigo-400 hover:text-indigo-300 transition-colors shrink-0 text-xs font-medium inline-flex items-center gap-1"
          >
            Traces <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 3. HSTS Downgrade Guard Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700/80 transition-colors shadow-sm">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <span className="flex items-center gap-1.5 font-semibold text-slate-300">
              {transport.hsts.status === 'Enforced' ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-amber-400" />
              )}
              HSTS Downgrade Guard
            </span>
            <span className={`text-[11px] font-mono font-medium ${
              transport.hsts.status === 'Enforced' ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {transport.hsts.status.toUpperCase()}
            </span>
          </div>

          <p className={`text-base font-semibold ${
            transport.hsts.status === 'Enforced' ? 'text-emerald-300' : 'text-amber-300'
          }`}>
            {transport.hsts.status === 'Enforced' ? 'Strict Protection Active' : 'Needs Remediation'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {transport.hsts.status === 'Enforced'
              ? 'Strict-Transport-Security sent with preload'
              : 'Strict-Transport-Security header absent'}
          </p>
        </div>

        <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            {transport.hsts.status === 'Enforced' ? 'Max-Age: 1y+' : 'Action Required'}
          </span>
          <button
            onClick={() => onNavigateToTab('findings')}
            className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium inline-flex items-center gap-1 text-xs"
          >
            {transport.hsts.status === 'Enforced' ? 'View Details' : 'View Fix'}
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 4. Cipher & Protocol Posture Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700/80 transition-colors shadow-sm">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <span className="flex items-center gap-1.5 font-semibold text-slate-300">
              <Cpu className="w-4 h-4 text-cyan-400" /> Cipher & Protocol
            </span>
            <span className="text-[11px] font-mono text-cyan-300 font-medium">
              {transport.tlsNegotiation.protocol}
            </span>
          </div>

          <p className="text-base font-semibold text-white truncate font-mono text-xs">
            {transport.tlsNegotiation.cipherSuite}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            PFS Enabled · ALPN: {transport.tlsNegotiation.alpnProtocols.join(', ')}
          </p>
        </div>

        <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400">Key: {certificate.publicKeyAlgorithm}</span>
          <button
            onClick={() => onNavigateToTab('overview')}
            className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium inline-flex items-center gap-1 text-xs"
          >
            Specs <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
