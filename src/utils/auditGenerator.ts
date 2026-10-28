import { AuditData, Finding, ComplianceItem } from '../types/security';

export function normalizeDomain(input: string): string {
  let cleaned = input.trim().toLowerCase();
  cleaned = cleaned.replace(/^https?:\/\//i, '');
  cleaned = cleaned.split('/')[0];
  cleaned = cleaned.split(':')[0]; // strip port
  return cleaned || 'demo.vibeprooflens.dev';
}

export function generateAuditForDomain(rawDomain: string): AuditData {
  const domain = normalizeDomain(rawDomain);
  const now = new Date();
  
  // Deterministic hash based on domain for consistent pseudo-realistic stats
  let hash = 0;
  for (let i = 0; i < domain.length; i++) {
    hash = (hash << 5) - hash + domain.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);

  const isCloudflare = domain.includes('cloudflare') || positiveHash % 3 === 0;
  const isGoogle = domain.includes('google') || domain.includes('youtube');
  const isGithub = domain.includes('github');
  const isStripe = domain.includes('stripe');
  const isBadOrExpiring = domain.includes('expire') || domain.includes('bad') || domain.includes('legacy');
  const isUntrusted = domain.includes('self-signed') || domain.includes('untrusted') || domain.includes('local');

  // Days remaining
  let daysRemaining = 45 + (positiveHash % 240);
  let status: 'Valid' | 'Expiring Soon' | 'Expired' | 'Untrusted' = 'Valid';
  let overallStatus: AuditData['status'] = 'Clear';
  let grade: AuditData['grade'] = 'A';

  if (isBadOrExpiring) {
    daysRemaining = 3;
    status = 'Expiring Soon';
    overallStatus = 'Critical';
    grade = 'F';
  } else if (isUntrusted) {
    daysRemaining = 90;
    status = 'Untrusted';
    overallStatus = 'Critical';
    grade = 'F';
  } else if (domain.includes('vibeproof') || positiveHash % 5 === 0) {
    daysRemaining = 28;
    status = 'Valid';
    overallStatus = 'Needs Fixing';
    grade = 'B+';
  } else if (isStripe || isGoogle || isGithub) {
    daysRemaining = 75;
    status = 'Valid';
    overallStatus = 'Clear';
    grade = 'A+';
  }

  // Issuer CA
  let issuer = "Let's Encrypt Authority R3";
  let issuerOrg = 'Internet Security Research Group (ISRG)';
  if (isGoogle) {
    issuer = 'GTS CA 1C3';
    issuerOrg = 'Google Trust Services LLC';
  } else if (isCloudflare) {
    issuer = 'Cloudflare Inc ECC CA-3';
    issuerOrg = 'Cloudflare, Inc.';
  } else if (isStripe) {
    issuer = 'DigiCert Global G2 TLS RSA SHA256 2020 CA1';
    issuerOrg = 'DigiCert Inc';
  } else if (isUntrusted) {
    issuer = 'Localhost Development Self-Signed CA';
    issuerOrg = 'Internal Unverified Organization';
  }

  const validFromDate = new Date(now.getTime() - (90 - (daysRemaining > 90 ? 30 : 10)) * 86400000);
  const validToDate = new Date(now.getTime() + daysRemaining * 86400000);

  const findings: Finding[] = [];
  const compliance: ComplianceItem[] = [];

  // HSTS check
  const hasHsts = (isGoogle || isGithub || isStripe || (!isBadOrExpiring && !isUntrusted && overallStatus === 'Clear'));
  const hstsMaxAge = hasHsts ? 31536000 : null;

  if (!hasHsts) {
    findings.push({
      id: 'TLS-007',
      ruleId: 'TLS-007',
      title: 'Missing Strict-Transport-Security (HSTS) Header',
      severity: 'Medium',
      kind: 'Configuration Defect',
      description: `The domain ${domain} does not transmit the Strict-Transport-Security response header. First-time visitors remain exposed to SSL-stripping man-in-the-middle attacks on public networks.`,
      evidence: `Evaluated port 443 HTTPS response for ${domain}. The 'strict-transport-security' header was absent.`,
      impact: 'Allows active network attackers to downgrade cleartext HTTP traffic before TLS handshakes.',
      standards: ['OWASP WSTG-CONF-07', 'RFC 6797 §7.1', 'NIST SP 800-52r2'],
      remediationPrompts: {
        nextjs: `// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          }
        ],
      },
    ];
  },
};`,
        nginx: `server {
    listen 443 ssl http2;
    server_name ${domain};
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
}`,
        apache: `Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"`,
        caddy: `header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"`,
        express: `app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }));`,
        cloudflare: `// In Cloudflare Rules: Add response header Strict-Transport-Security = max-age=31536000; includeSubDomains; preload`
      }
    });
  }

  if (isBadOrExpiring) {
    findings.unshift({
      id: 'TLS-001',
      ruleId: 'TLS-001',
      title: 'Certificate Imminently Expiring (< 7 Days Remaining)',
      severity: 'Critical',
      kind: 'Vulnerability',
      description: `The certificate for ${domain} expires in ${daysRemaining} days. Automated client browsers will reject connections immediately upon certificate expiration.`,
      evidence: `Valid To: ${validToDate.toISOString().split('T')[0]}. Time delta: ${daysRemaining} days remaining.`,
      impact: 'Total website downtime and fatal browser warning dialogs for end-users.',
      standards: ['NIST SP 800-52r2 §3.1', 'CAB Forum Baseline Requirements §6.3.2'],
      remediationPrompts: {
        nextjs: `// Renew the SSL certificate through your hosting edge (Vercel, AWS ACM, or Let's Encrypt).`,
        nginx: `sudo certbot renew --nginx`,
        apache: `sudo certbot renew --apache`,
        caddy: `sudo systemctl reload caddy`,
        express: `// Verify ACME auto-renewal bot is configured in systemd or Docker container`,
        cloudflare: `// Check Cloudflare Edge Certificates > Universal SSL status`
      }
    });
  }

  if (isUntrusted) {
    findings.unshift({
      id: 'TLS-003',
      ruleId: 'TLS-003',
      title: 'Untrusted Self-Signed Certificate Authority',
      severity: 'Critical',
      kind: 'Vulnerability',
      description: 'The certificate issuer is not recognized by standard public operating system trust stores (Mozilla NSS / Microsoft Root / Apple Keychain).',
      evidence: `Issuer common name: "${issuer}". Not in public CA bundle.`,
      impact: 'Fatal browser NET::ERR_CERT_AUTHORITY_INVALID interruption for every visitor.',
      standards: ['CAB Forum Baseline Requirements §7.1.4', 'RFC 5280 §6.1'],
      remediationPrompts: {
        nextjs: `// Provision a free trusted certificate via Let's Encrypt, Cloudflare, or AWS ACM`,
        nginx: `sudo certbot --nginx -d ${domain}`,
        apache: `sudo certbot --apache -d ${domain}`,
        caddy: `# Caddy handles trusted CA provisioning automatically`,
        express: `// Use certbot or a reverse proxy (Caddy/Nginx) in front of Node.js`,
        cloudflare: `// Route traffic through Cloudflare CDN for free public Edge TLS`
      }
    });
  }

  // Compliance checklist
  compliance.push({
    id: 'comp-1',
    standard: 'OWASP ASVS 4.0',
    section: '9.1.1',
    requirement: 'Enforce TLS for all traffic; redirect plain HTTP to HTTPS.',
    status: isBadOrExpiring ? 'Fail' : 'Pass',
    notes: isBadOrExpiring ? 'Plaintext port 80 served without redirect' : 'Permanent redirect 301/308 enforced on Port 80.'
  });

  compliance.push({
    id: 'comp-2',
    standard: 'OWASP ASVS 4.0',
    section: '9.2.1',
    requirement: 'HTTP Strict Transport Security (HSTS) with long expiry.',
    status: hasHsts ? 'Pass' : 'Fail',
    notes: hasHsts ? 'HSTS max-age >= 31536000 enforced with includeSubDomains.' : 'HSTS header missing from responses.'
  });

  compliance.push({
    id: 'comp-3',
    standard: 'PCI-DSS 4.0',
    section: 'Req 4.1',
    requirement: 'Use strong cryptography and modern TLS versions (TLS 1.2+).',
    status: isUntrusted ? 'Fail' : 'Pass',
    notes: isUntrusted ? 'Untrusted CA violates PCI-DSS requirement 4.1.' : 'TLS 1.3 with AES-256-GCM / ChaCha20 compliant.'
  });

  compliance.push({
    id: 'comp-4',
    standard: 'Chrome HSTS Preload',
    section: 'Preload Checklist',
    requirement: 'Serve valid cert, redirect port 80, max-age >= 10886400, includeSubDomains, preload token.',
    status: hasHsts ? 'Pass' : 'Fail',
    notes: hasHsts ? 'Ready for chromium hsts preload submission.' : 'Missing HSTS header or preload directive.'
  });

  const hexBytes = (length: number) => {
    return Array.from({ length }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()).join(':');
  };

  return {
    targetUrl: `https://${domain}`,
    domain,
    ipAddress: `${(positiveHash % 150) + 50}.${(positiveHash % 200) + 10}.${(positiveHash % 100) + 1}.${(positiveHash % 250) + 1}`,
    evaluatedAt: now.toISOString(),
    grade,
    status: overallStatus,
    certificate: {
      subject: domain,
      commonName: domain,
      issuer,
      issuerOrg,
      validFrom: validFromDate.toISOString(),
      validTo: validToDate.toISOString(),
      daysRemaining,
      status,
      trustChain: isUntrusted ? 'Untrusted Self-Signed Root' : `Trusted Public CA (${issuer})`,
      san: [domain, `www.${domain}`, `api.${domain}`],
      signatureAlgorithm: 'SHA256withRSA',
      publicKeyAlgorithm: positiveHash % 2 === 0 ? 'ECDSA (NIST P-256)' : 'RSA (2048 bit)',
      keySizeBits: positiveHash % 2 === 0 ? 256 : 2048,
      serialNumber: hexBytes(16),
      fingerprintSha256: hexBytes(32),
      fingerprintSha1: hexBytes(20),
      ocspStapled: !isUntrusted,
      sctCount: isUntrusted ? 0 : 2,
      pemString: `-----BEGIN CERTIFICATE-----
MIIEkjCCA3qgAwIBAgIRAP7xL${domain.slice(0, 8)}...
[X.509 Leaf Certificate for ${domain}]
Public Key: ${positiveHash % 2 === 0 ? 'ECDSA P-256' : 'RSA 2048-bit'}
Issuer: ${issuer}
-----END CERTIFICATE-----`
    },
    transport: {
      httpRedirect: {
        status: isBadOrExpiring ? 'Missing' : 'Enforced',
        code: isBadOrExpiring ? 200 : 308,
        destination: `https://${domain}/`,
        plaintextAllowed: isBadOrExpiring,
        hops: [
          { url: `http://${domain}/`, status: isBadOrExpiring ? 200 : 308 },
          { url: `https://${domain}/`, status: 200 }
        ]
      },
      tlsNegotiation: {
        protocol: isUntrusted ? 'TLSv1.2' : 'TLSv1.3',
        cipherSuite: isUntrusted ? 'TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA' : 'TLS_AES_256_GCM_SHA384',
        perfectForwardSecrecy: true,
        alpnProtocols: ['h2', 'http/1.1']
      },
      hsts: {
        status: hasHsts ? 'Enforced' : 'Missing',
        header: hasHsts ? 'max-age=31536000; includeSubDomains; preload' : null,
        maxAge: hstsMaxAge,
        includeSubDomains: hasHsts,
        preload: hasHsts,
        preloadEligible: hasHsts
      }
    },
    findings,
    compliance,
    rawHeaders: {
      'server': isCloudflare ? 'cloudflare' : 'nginx/1.25.3',
      'date': now.toUTCString(),
      'content-type': 'text/html; charset=utf-8',
      'connection': 'keep-alive',
      ...(hasHsts ? { 'strict-transport-security': 'max-age=31536000; includeSubDomains; preload' } : {}),
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'SAMEORIGIN'
    }
  };
}
