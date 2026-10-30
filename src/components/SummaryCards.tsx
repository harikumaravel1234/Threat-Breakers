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
      <div className="bg-[#162235] border border-[#26374F] rounded-xl p-5 flex flex-col justify-between hover:border-[#3B82F6]/50 transition-colors shadow-sm">
        <div>
          <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-3">
            <span className="flex items-center gap-1.5 font-semibold text-[#F8FAFC]">
              {certificate.status === 'Valid' ? (
                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-[#F43F5E]" />
              )}
              Certificate Validity
            </span>
            <span className={`text-[11px] font-mono font-medium ${
              certificate.status === 'Valid' ? 'text-[#10B981]' : 'text-[#F43F5E]'
            }`}>
              {certificate.status === 'Valid' ? 'TRUSTED CA' : certificate.status.toUpperCase()}
            </span>
          </div>

          <p className="text-base font-semibold text-[#F8FAFC] truncate font-mono" title={certificate.subject}>
            {certificate.subject}
          </p>
          <p className="text-xs text-[#94A3B8] mt-1 truncate" title={certificate.issuer}>
            Issued by: <span className="text-[#F8FAFC]">{certificate.issuer}</span>
          </p>
        </div>

        <div className="mt-5 pt-3.5 border-t border-[#26374F] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#94A3B8] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#94A3B8]" /> Expiry Window
            </span>
            <span className={`font-mono font-medium tabular-nums ${
              isExpiringCritical ? 'text-[#F43F5E]' :
              isExpiringWarning ? 'text-[#FACC15]' : 'text-[#10B981]'
            }`}>
              {certificate.daysRemaining <= 0 ? 'Expired' : `${certificate.daysRemaining} days left`}
            </span>
          </div>
          {/* Visual progress bar */}
          <div className="w-full bg-[#0B1220] h-1.5 rounded-full overflow-hidden border border-[#26374F]">
            <div
              className={`h-full transition-all duration-500 ${
                isExpiringCritical ? 'bg-[#F43F5E]' :
                isExpiringWarning ? 'bg-[#FACC15]' : 'bg-[#10B981]'
              }`}
              style={{ width: `${percentRemaining}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. HTTP-to-HTTPS Redirection Card */}
      <div className="bg-[#162235] border border-[#26374F] rounded-xl p-5 flex flex-col justify-between hover:border-[#3B82F6]/50 transition-colors shadow-sm">
        <div>
          <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-3">
            <span className="flex items-center gap-1.5 font-semibold text-[#F8FAFC]">
              <Globe className="w-4 h-4 text-[#06B6D4]" /> Port 80 Ingress
            </span>
            <span className="text-[11px] font-mono text-[#06B6D4] font-medium">
              STATUS {transport.httpRedirect.code}
            </span>
          </div>

          <p className="text-base font-semibold text-[#F8FAFC] flex items-center gap-2">
            <span>{transport.httpRedirect.status}</span>
            {transport.httpRedirect.status === 'Enforced' ? (
              <span className="text-xs font-normal text-[#10B981] flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Enforced
              </span>
            ) : (
              <span className="text-xs font-normal text-[#F43F5E] flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Cleartext Ingress
              </span>
            )}
          </p>
          <p className="text-xs text-[#94A3B8] mt-1">
            {transport.httpRedirect.status === 'Enforced'
              ? 'Cleartext HTTP permanently redirected to TLS'
              : 'Plain HTTP allowed without TLS redirect!'}
          </p>
        </div>

        <div className="mt-5 pt-3.5 border-t border-[#26374F] flex items-center justify-between text-xs">
          <span className="text-[#94A3B8] truncate max-w-[170px]" title={transport.httpRedirect.destination}>
            → <code className="font-mono text-[#F8FAFC]">{transport.httpRedirect.destination}</code>
          </span>
          <button
            onClick={() => onNavigateToTab('transport')}
            className="text-[#06B6D4] hover:text-[#38BDF8] transition-colors shrink-0 text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
          >
            Traces <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 3. HSTS Downgrade Guard Card */}
      <div className="bg-[#162235] border border-[#26374F] rounded-xl p-5 flex flex-col justify-between hover:border-[#3B82F6]/50 transition-colors shadow-sm">
        <div>
          <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-3">
            <span className="flex items-center gap-1.5 font-semibold text-[#F8FAFC]">
              {transport.hsts.status === 'Enforced' ? (
                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-[#FACC15]" />
              )}
              HSTS Downgrade Guard
            </span>
            <span className={`text-[11px] font-mono font-medium ${
              transport.hsts.status === 'Enforced' ? 'text-[#10B981]' : 'text-[#FACC15]'
            }`}>
              {transport.hsts.status.toUpperCase()}
            </span>
          </div>

          <p className={`text-base font-semibold ${
            transport.hsts.status === 'Enforced' ? 'text-[#10B981]' : 'text-[#FACC15]'
          }`}>
            {transport.hsts.status === 'Enforced' ? 'Strict Protection Active' : 'Needs Remediation'}
          </p>
          <p className="text-xs text-[#94A3B8] mt-1">
            {transport.hsts.status === 'Enforced'
              ? 'Strict-Transport-Security sent with preload'
              : 'Strict-Transport-Security header absent'}
          </p>
        </div>

        <div className="mt-5 pt-3.5 border-t border-[#26374F] flex items-center justify-between text-xs">
          <span className="text-[#94A3B8]">
            {transport.hsts.status === 'Enforced' ? 'Max-Age: 1y+' : 'Action Required'}
          </span>
          <button
            onClick={() => onNavigateToTab('findings')}
            className="text-[#06B6D4] hover:text-[#38BDF8] transition-colors font-medium inline-flex items-center gap-1 text-xs cursor-pointer"
          >
            {transport.hsts.status === 'Enforced' ? 'View Details' : 'View Fix'}
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 4. Cipher & Protocol Posture Card */}
      <div className="bg-[#162235] border border-[#26374F] rounded-xl p-5 flex flex-col justify-between hover:border-[#3B82F6]/50 transition-colors shadow-sm">
        <div>
          <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-3">
            <span className="flex items-center gap-1.5 font-semibold text-[#F8FAFC]">
              <Cpu className="w-4 h-4 text-[#06B6D4]" /> Cipher & Protocol
            </span>
            <span className="text-[11px] font-mono text-[#06B6D4] font-medium">
              {transport.tlsNegotiation.protocol}
            </span>
          </div>

          <p className="text-base font-semibold text-[#F8FAFC] truncate font-mono text-xs">
            {transport.tlsNegotiation.cipherSuite}
          </p>
          <p className="text-xs text-[#94A3B8] mt-1">
            PFS Enabled · ALPN: {transport.tlsNegotiation.alpnProtocols.join(', ')}
          </p>
        </div>

        <div className="mt-5 pt-3.5 border-t border-[#26374F] flex items-center justify-between text-xs">
          <span className="text-[#94A3B8]">Key: {certificate.publicKeyAlgorithm}</span>
          <button
            onClick={() => onNavigateToTab('overview')}
            className="text-[#06B6D4] hover:text-[#38BDF8] transition-colors font-medium inline-flex items-center gap-1 text-xs cursor-pointer"
          >
            Specs <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
