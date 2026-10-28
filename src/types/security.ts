export type Severity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
export type AuditStatus = 'Clear' | 'Needs Fixing' | 'Critical' | 'Inconclusive';

export interface CertificateInfo {
  subject: string;
  commonName: string;
  issuer: string;
  issuerOrg?: string;
  validFrom: string;
  validTo: string;
  daysRemaining: number;
  status: 'Valid' | 'Expiring Soon' | 'Expired' | 'Untrusted';
  trustChain: string;
  san: string[];
  signatureAlgorithm: string;
  publicKeyAlgorithm: string;
  keySizeBits: number;
  serialNumber: string;
  fingerprintSha256: string;
  fingerprintSha1: string;
  ocspStapled: boolean;
  sctCount: number;
  pemString: string;
}

export interface TransportInfo {
  httpRedirect: {
    status: 'Enforced' | 'Missing' | 'Broken';
    code: number;
    destination: string;
    plaintextAllowed: boolean;
    hops: Array<{ url: string; status: number }>;
  };
  tlsNegotiation: {
    protocol: 'TLSv1.3' | 'TLSv1.2' | 'TLSv1.1' | 'TLSv1.0';
    cipherSuite: string;
    perfectForwardSecrecy: boolean;
    alpnProtocols: string[];
  };
  hsts: {
    status: 'Enforced' | 'Missing' | 'Weak';
    header: string | null;
    maxAge: number | null;
    includeSubDomains: boolean;
    preload: boolean;
    preloadEligible: boolean;
  };
}

export type SupportedFramework = 'nextjs' | 'nginx' | 'apache' | 'caddy' | 'express' | 'cloudflare';

export interface Finding {
  id: string;
  ruleId: string;
  title: string;
  severity: Severity;
  kind: 'Vulnerability' | 'Configuration Defect' | 'Potential' | 'Best Practice';
  description: string;
  evidence: string;
  impact: string;
  standards: string[];
  remediationPrompts: Record<SupportedFramework, string>;
}

export interface ComplianceItem {
  id: string;
  standard: 'OWASP ASVS 4.0' | 'PCI-DSS 4.0' | 'HIPAA' | 'Chrome HSTS Preload';
  section: string;
  requirement: string;
  status: 'Pass' | 'Fail' | 'Warning';
  notes: string;
}

export interface AuditData {
  targetUrl: string;
  domain: string;
  ipAddress: string;
  evaluatedAt: string;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'F';
  status: AuditStatus;
  certificate: CertificateInfo;
  transport: TransportInfo;
  findings: Finding[];
  compliance: ComplianceItem[];
  rawHeaders: Record<string, string>;
}
