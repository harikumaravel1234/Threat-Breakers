import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Clock, 
  ExternalLink, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Lock, 
  Globe, 
  RefreshCw,
  Layers,
  FileCheck,
  Terminal,
  Download,
  Share2
} from 'lucide-react';
import { HeaderBar } from './components/HeaderBar';
import { TargetScanBar } from './components/TargetScanBar';
import { ScorecardBanner } from './components/ScorecardBanner';
import { SummaryCards } from './components/SummaryCards';
import { OverviewTab } from './components/tabs/OverviewTab';
import { TransportTab } from './components/tabs/TransportTab';
import { FindingsTab } from './components/tabs/FindingsTab';
import { ComplianceTab } from './components/tabs/ComplianceTab';
import { RawInspectorTab } from './components/tabs/RawInspectorTab';
import { ExpirySimulatorModal } from './components/ExpirySimulatorModal';
import { mockAudits } from './data/mockAudits';
import { generateAuditForDomain, normalizeDomain } from './utils/auditGenerator';
import { AuditData } from './types/security';

export default function App() {
  // Start with user's baseline demo: demo.vibeprooflens.dev
  const [data, setData] = useState<AuditData>(mockAudits['demo.vibeprooflens.dev']);
  const [activeTab, setActiveTab] = useState<'overview' | 'transport' | 'findings' | 'compliance' | 'raw'>('overview');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState({ step: 1, label: 'Initiating probe...' });
  const [isExpiryModalOpen, setIsExpiryModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const executeScan = (targetDomain: string) => {
    const domain = normalizeDomain(targetDomain);
    setIsScanning(true);
    setScanProgress({ step: 1, label: 'Resolving DNS & Port 80 plaintext ingress...' });

    setTimeout(() => {
      setScanProgress({ step: 2, label: 'Negotiating TLS 1.3 / 1.2 handshake on port 443...' });
      
      setTimeout(() => {
        setScanProgress({ step: 3, label: 'Validating X.509 chain & CA trust stores...' });
        
        setTimeout(() => {
          setScanProgress({ step: 4, label: 'Auditing security headers & downgrade defense...' });
          
          setTimeout(() => {
            // Check if we have exact mock, otherwise generate dynamic realistic data
            if (mockAudits[domain]) {
              setData(mockAudits[domain]);
            } else {
              setData(generateAuditForDomain(domain));
            }
            setIsScanning(false);
            showToast(`Completed TLS audit for ${domain}`);
          }, 350);
        }, 350);
      }, 350);
    }, 400);
  };

  const handleRetest = () => {
    executeScan(data.domain);
  };

  const handleApplyDays = (days: number) => {
    const updatedCert = {
      ...data.certificate,
      daysRemaining: days,
      status: (days <= 0 ? 'Expired' : days < 14 ? 'Expiring Soon' : 'Valid') as any,
    };

    let updatedFindings = [...data.findings];
    // If expiring or expired, ensure critical finding exists
    if (days <= 7 && !updatedFindings.some((f) => f.id === 'TLS-001')) {
      updatedFindings.unshift({
        id: 'TLS-001',
        ruleId: 'TLS-001',
        title: days <= 0 ? 'Certificate Has Expired (Service Interrupted)' : 'Certificate Imminently Expiring (< 7 Days Remaining)',
        severity: 'Critical',
        kind: 'Vulnerability',
        description: `Certificate validity window has reached ${days} days. Automated clients and browsers will generate security warnings.`,
        evidence: `Calculated days remaining: ${days}.`,
        impact: 'Full browser security block, loss of customer trust and payment processing errors.',
        standards: ['NIST SP 800-52r2 §3.1', 'CAB Forum Baseline Requirements §6.3.2'],
        remediationPrompts: {
          nextjs: '// Trigger emergency renewal via host or ACME Certbot client',
          nginx: 'sudo certbot renew --force-renewal --nginx',
          apache: 'sudo certbot renew --force-renewal --apache',
          caddy: 'sudo systemctl restart caddy',
          express: '// Renew ACME certificate pair and reload HTTPS credentials',
          cloudflare: '// SSL/TLS > Edge Certificates > Re-request Universal SSL'
        }
      });
    } else if (days > 14) {
      updatedFindings = updatedFindings.filter((f) => f.id !== 'TLS-001');
    }

    const newStatus = (days <= 0 ? 'Critical' : updatedFindings.length > 0 ? (updatedFindings.some(f => f.severity === 'Critical') ? 'Critical' : 'Needs Fixing') : 'Clear') as any;
    const newGrade = days <= 0 ? 'F' : days <= 7 ? 'C' : updatedFindings.length === 0 ? 'A+' : 'B+';

    setData({
      ...data,
      status: newStatus,
      grade: newGrade,
      certificate: updatedCert,
      findings: updatedFindings
    });

    showToast(`Simulated expiration set to ${days} days.`);
  };

  const handleExportReport = () => {
    const markdownContent = `# VibeProof Lens Security Audit Report
**Target**: ${data.targetUrl}
**Evaluated At**: ${data.evaluatedAt}
**Security Grade**: ${data.grade} (${data.status})
**IP Address**: ${data.ipAddress}

## Certificate Specifications
- **Common Name**: ${data.certificate.commonName}
- **Issuer**: ${data.certificate.issuer} (${data.certificate.issuerOrg})
- **Status**: ${data.certificate.status} (${data.certificate.daysRemaining} days remaining)
- **Public Key**: ${data.certificate.publicKeyAlgorithm}
- **Fingerprint SHA-256**: ${data.certificate.fingerprintSha256}

## Transport Security
- **Port 80 Plaintext Redirect**: ${data.transport.httpRedirect.status} (HTTP ${data.transport.httpRedirect.code} -> ${data.transport.httpRedirect.destination})
- **TLS Version**: ${data.transport.tlsNegotiation.protocol}
- **Cipher Suite**: ${data.transport.tlsNegotiation.cipherSuite}
- **HSTS Policy**: ${data.transport.hsts.status} (${data.transport.hsts.header || 'Header Absent'})

## Identified Findings (${data.findings.length})
${data.findings.length === 0 ? 'No findings detected. System fully compliant.' : data.findings.map(f => `
### [${f.ruleId}] ${f.title} (${f.severity})
- **Kind**: ${f.kind}
- **Description**: ${f.description}
- **Deterministic Evidence**: ${f.evidence}
- **Standards**: ${f.standards.join(', ')}
`).join('\n')}

---
*Generated by VibeProof Lens Hosting & Domain Security Engine*`;

    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VibeProof-Audit-${data.domain}-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Exported Markdown Security Audit Report!');
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Bar Navigation Contract */}
      <HeaderBar
        activeSection={activeTab}
        onNavigateSection={(tab: any) => setActiveTab(tab)}
        onExportReport={handleExportReport}
      />

      {/* Main Workspace Canvas */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Domain Scanner & Target Selector */}
        <TargetScanBar
          currentDomain={data.domain}
          onScanDomain={executeScan}
          isScanning={isScanning}
          scanProgress={scanProgress}
        />

        {/* Evaluated Target Scorecard Banner */}
        <ScorecardBanner
          data={data}
          onRetest={handleRetest}
          isRetesting={isScanning}
          onOpenExpirySimulator={() => setIsExpiryModalOpen(true)}
        />

        {/* Visual Layer Summary Cards */}
        <SummaryCards
          data={data}
          onNavigateToTab={(tab: any) => setActiveTab(tab)}
        />

        {/* Navigation Tabs (Functional Segmented Buttons with Active States) */}
        <div className="border-b border-slate-800">
          <nav className="flex space-x-6 sm:space-x-8 text-sm overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`pb-3 font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'overview'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Certificate & Chain</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('transport')}
              className={`pb-3 font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'transport'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>Transport & Downgrade Guard</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('findings')}
              className={`pb-3 font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'findings'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Actionable Findings</span>
              {data.findings.length > 0 ? (
                <span className="bg-amber-950 text-amber-300 border border-amber-800/80 text-xs px-2 py-0.2 rounded-md font-mono font-bold">
                  {data.findings.length}
                </span>
              ) : (
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-800/80 text-xs px-1.5 py-0.2 rounded-md font-mono">
                  0
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('compliance')}
              className={`pb-3 font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'compliance'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Compliance Matrix</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('raw')}
              className={`pb-3 font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'raw'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-4 h-4 text-slate-400" />
              <span>Raw PEM & Headers</span>
            </button>
          </nav>
        </div>

        {/* Tab Viewport Contents */}
        <div className="pt-2">
          {activeTab === 'overview' && <OverviewTab data={data} />}
          {activeTab === 'transport' && <TransportTab data={data} />}
          {activeTab === 'findings' && <FindingsTab findings={data.findings} targetUrl={data.targetUrl} />}
          {activeTab === 'compliance' && <ComplianceTab data={data} />}
          {activeTab === 'raw' && <RawInspectorTab data={data} />}
        </div>
      </main>

      {/* Expiry Simulator Modal */}
      <ExpirySimulatorModal
        isOpen={isExpiryModalOpen}
        onClose={() => setIsExpiryModalOpen(false)}
        currentDays={data.certificate.daysRemaining}
        onApplyDays={handleApplyDays}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-indigo-500/50 text-white text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Quiet Footer */}
      <footer className="mt-16 border-t border-slate-900 py-6 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2 font-mono">
          <span>VibeProof Lens Security Architecture</span>
          <span className="text-slate-700">·</span>
          <span>Module 5.1 (HTTPS & Certificate Safety)</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>RFC 5280 · RFC 6797 · OWASP ASVS 4.0</span>
        </div>
      </footer>
    </div>
  );
}
