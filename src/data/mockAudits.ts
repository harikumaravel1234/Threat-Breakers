import { AuditData } from '../types/security';

export const mockAudits: Record<string, AuditData> = {
  'demo.vibeprooflens.dev': {
    targetUrl: 'https://demo.vibeprooflens.dev',
    domain: 'demo.vibeprooflens.dev',
    ipAddress: '104.21.72.19',
    evaluatedAt: '2026-11-04T09:30:15Z',
    grade: 'B+',
    status: 'Needs Fixing',
    certificate: {
      subject: 'demo.vibeprooflens.dev',
      commonName: 'demo.vibeprooflens.dev',
      issuer: "Let's Encrypt Authority X3",
      issuerOrg: 'Internet Security Research Group (ISRG)',
      validFrom: '2026-09-01T00:00:00Z',
      validTo: '2026-12-01T23:59:59Z',
      daysRemaining: 28,
      status: 'Valid',
      trustChain: 'Trusted Public CA (ISRG Root X1 ➔ R3 Intermediate)',
      san: ['demo.vibeprooflens.dev', 'www.demo.vibeprooflens.dev', 'api.demo.vibeprooflens.dev'],
      signatureAlgorithm: 'SHA256withRSA',
      publicKeyAlgorithm: 'RSA (2048 bit)',
      keySizeBits: 2048,
      serialNumber: '04:8E:22:1A:99:BC:88:14:2C:DE:71:09:FE',
      fingerprintSha256: '8F:3A:D4:79:1B:62:EE:95:C0:E1:92:B4:73:11:06:58:22:91:DE:AC:84:7B:60:F4:12:49:EE:29:43:21:88:90',
      fingerprintSha1: 'D1:79:AC:21:44:89:12:EE:51:77:43:99:10:04:81:66:33:41:90:5B',
      ocspStapled: true,
      sctCount: 2,
      pemString: `-----BEGIN CERTIFICATE-----
MIIFazCCBFGgAwIBAgIRAI+iGpm8iBQs3nEJ/qU01zowDQYJKoZIhvcNAQELBQAw
GzEZMBcGA1UEAxMQTGV0J3MgRW5jcnlwdCBSMzAeFw0yNjA5MDEwMDAwMDBaFw0y
NjEyMDEyMzU5NTlaMB8xHTAbBgNVBAMMFFZpYmVQcm9vZkxlbnMgRGVtbzCCASIw
DQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAL05n5hK4XvP2YyZ8U1jQJqO+x
uH2T8Z3yW9eC1r+k0/QO6v8T11tGf2E5L8iU4a9qW2P1f3yO/4eK7tG6s+xU
... [Truncated for preview — 2048-bit RSA Leaf Certificate] ...
8K4xVjM9uA1L3sF6wX92kE0P==
-----END CERTIFICATE-----`
    },
    transport: {
      httpRedirect: {
        status: 'Enforced',
        code: 308,
        destination: 'https://demo.vibeprooflens.dev/',
        plaintextAllowed: false,
        hops: [
          { url: 'http://demo.vibeprooflens.dev/', status: 308 },
          { url: 'https://demo.vibeprooflens.dev/', status: 200 }
        ]
      },
      tlsNegotiation: {
        protocol: 'TLSv1.3',
        cipherSuite: 'TLS_AES_256_GCM_SHA384',
        perfectForwardSecrecy: true,
        alpnProtocols: ['h2', 'http/1.1']
      },
      hsts: {
        status: 'Missing',
        header: null,
        maxAge: null,
        includeSubDomains: false,
        preload: false,
        preloadEligible: false
      }
    },
    findings: [
      {
        id: 'TLS-007',
        ruleId: 'TLS-007',
        title: 'Missing Strict-Transport-Security (HSTS) Header',
        severity: 'Medium',
        kind: 'Configuration Defect',
        description: 'The web server does not send the Strict-Transport-Security header over HTTPS. Visitors remain vulnerable to SSL stripping man-in-the-middle attacks on insecure networks when initiating first contact via plain HTTP.',
        evidence: "Port 443 response headers evaluated. Header 'strict-transport-security' was absent.",
        impact: 'Attacker on a shared Wi-Fi network could intercept initial port 80 requests and strip HTTPS redirect before user establishes TLS session.',
        standards: ['OWASP WSTG-CONF-07', 'RFC 6797 §7.1', 'NIST SP 800-52r2'],
        remediationPrompts: {
          nextjs: `// next.config.js - Add HSTS header to all routes
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
          nginx: `# /etc/nginx/conf.d/security-headers.conf
server {
    listen 443 ssl http2;
    server_name demo.vibeprooflens.dev;

    # Enforce HSTS for 1 year with subdomains and preload eligibility
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
}`,
          apache: `# .htaccess or httpd.conf
<IfModule mod_headers.c>
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
</IfModule>`,
          caddy: `# Caddyfile
demo.vibeprooflens.dev {
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        -Server
    }
    reverse_proxy localhost:3000
}`,
          express: `// Express.js with Helmet middleware
import express from 'express';
import helmet from 'helmet';

const app = express();

app.use(
  helmet.hsts({
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true,
  })
);`,
          cloudflare: `// Cloudflare Workers or Transform Rules:
// Navigate to Rules > Transform Rules > Modify Response Header
// Set Static Header:
// Header Name: Strict-Transport-Security
// Value: max-age=31536000; includeSubDomains; preload`
        }
      }
    ],
    compliance: [
      {
        id: 'comp-1',
        standard: 'OWASP ASVS 4.0',
        section: '9.1.1',
        requirement: 'Verify that TLS is used for all incoming connections and insecure HTTP is redirected to HTTPS.',
        status: 'Pass',
        notes: 'HTTP port 80 returns permanent redirect 308 to HTTPS.'
      },
      {
        id: 'comp-2',
        standard: 'OWASP ASVS 4.0',
        section: '9.2.1',
        requirement: 'Verify that HTTP Strict Transport Security (HSTS) is implemented with long duration and preload.',
        status: 'Fail',
        notes: 'Strict-Transport-Security header is completely missing.'
      },
      {
        id: 'comp-3',
        standard: 'PCI-DSS 4.0',
        section: 'Req 4.1',
        requirement: 'Strong cryptography and security protocols are used to safeguard sensitive cardholder data.',
        status: 'Pass',
        notes: 'TLS 1.3 negotiated with TLS_AES_256_GCM_SHA384.'
      },
      {
        id: 'comp-4',
        standard: 'Chrome HSTS Preload',
        section: 'Eligibility Criteria',
        requirement: 'Valid certificate, redirect HTTP to HTTPS, max-age >= 10886400 (18 weeks), includeSubDomains, and preload token.',
        status: 'Fail',
        notes: 'HSTS header missing from root domain.'
      }
    ],
    rawHeaders: {
      'server': 'nginx/1.24.0',
      'date': 'Wed, 04 Nov 2026 09:30:15 GMT',
      'content-type': 'text/html; charset=utf-8',
      'content-length': '842',
      'connection': 'keep-alive',
      'vary': 'Accept-Encoding',
      'x-powered-by': 'Next.js',
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'SAMEORIGIN'
    }
  },

  'vault.fintech-api.cloud': {
    targetUrl: 'https://vault.fintech-api.cloud',
    domain: 'vault.fintech-api.cloud',
    ipAddress: '151.101.65.140',
    evaluatedAt: '2026-10-28T14:10:00Z',
    grade: 'A+',
    status: 'Clear',
    certificate: {
      subject: 'vault.fintech-api.cloud',
      commonName: 'vault.fintech-api.cloud',
      issuer: 'DigiCert Global G2 TLS RSA SHA256 2020 CA1',
      issuerOrg: 'DigiCert Inc',
      validFrom: '2026-06-15T00:00:00Z',
      validTo: '2027-06-15T23:59:59Z',
      daysRemaining: 230,
      status: 'Valid',
      trustChain: 'Trusted Public CA (DigiCert Global Root G2)',
      san: ['vault.fintech-api.cloud', 'api.fintech-api.cloud', 'secure.fintech-api.cloud'],
      signatureAlgorithm: 'SHA256withRSA',
      publicKeyAlgorithm: 'ECDSA (NIST P-256)',
      keySizeBits: 256,
      serialNumber: '02:FF:99:A1:33:04:77:88:12:34:65:BB:CC',
      fingerprintSha256: '44:91:2E:BC:33:FA:11:82:90:3A:88:51:76:CD:00:81:AA:52:09:12:71:04:F8:A1:EE:59:02:11:89:33:51:88',
      fingerprintSha1: '7A:90:EE:12:43:99:81:22:11:05:AA:77:33:41:88:22:90:AA:BB:CC',
      ocspStapled: true,
      sctCount: 3,
      pemString: `-----BEGIN CERTIFICATE-----
MIICljCCAXygAwIBAgIQAv+ZoTMEeIgsNGW7zDANBgkqhkiG9w0BAQsFADBLMQsw
CQYDVQQGEwJVUzERMA8GA1UEChMIRGlnaUNlcnQxKTAnBgNVBAMTIFJldm9jYXRp
b24gSW50ZXJtZWRpYXRlIENBIDIwMjYwHhcNMjYwNjE1MDAwMDAwWhcNMjcwNjE1
... [DigiCert High Assurance EV TLS Certificate] ...
-----END CERTIFICATE-----`
    },
    transport: {
      httpRedirect: {
        status: 'Enforced',
        code: 301,
        destination: 'https://vault.fintech-api.cloud/',
        plaintextAllowed: false,
        hops: [
          { url: 'http://vault.fintech-api.cloud/', status: 301 },
          { url: 'https://vault.fintech-api.cloud/', status: 200 }
        ]
      },
      tlsNegotiation: {
        protocol: 'TLSv1.3',
        cipherSuite: 'TLS_CHACHA20_POLY1305_SHA256',
        perfectForwardSecrecy: true,
        alpnProtocols: ['h3', 'h2', 'http/1.1']
      },
      hsts: {
        status: 'Enforced',
        header: 'max-age=63072000; includeSubDomains; preload',
        maxAge: 63072000,
        includeSubDomains: true,
        preload: true,
        preloadEligible: true
      }
    },
    findings: [],
    compliance: [
      {
        id: 'comp-1',
        standard: 'OWASP ASVS 4.0',
        section: '9.1.1',
        requirement: 'Enforce TLS for all traffic; redirect plain HTTP.',
        status: 'Pass',
        notes: 'HTTP 301 enforced immediately on port 80.'
      },
      {
        id: 'comp-2',
        standard: 'OWASP ASVS 4.0',
        section: '9.2.1',
        requirement: 'Strict-Transport-Security (HSTS) with long expiry and preload.',
        status: 'Pass',
        notes: 'max-age=63072000 (2 years), includeSubDomains & preload present.'
      },
      {
        id: 'comp-3',
        standard: 'PCI-DSS 4.0',
        section: 'Req 4.1',
        requirement: 'Cardholder transmission cryptography.',
        status: 'Pass',
        notes: 'ECDSA P-256 with ChaCha20-Poly1305 under TLS 1.3.'
      },
      {
        id: 'comp-4',
        standard: 'Chrome HSTS Preload',
        section: 'Eligibility Criteria',
        requirement: 'All preload criteria satisfied.',
        status: 'Pass',
        notes: 'Fully submitted and active in Chrome HSTS preload list.'
      }
    ],
    rawHeaders: {
      'server': 'cloudflare',
      'date': 'Wed, 28 Oct 2026 14:10:00 GMT',
      'strict-transport-security': 'max-age=63072000; includeSubDomains; preload',
      'content-security-policy': "default-src 'self'; frame-ancestors 'none';",
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'DENY'
    }
  },

  'legacy-billing.internal.org': {
    targetUrl: 'https://legacy-billing.internal.org',
    domain: 'legacy-billing.internal.org',
    ipAddress: '198.51.100.82',
    evaluatedAt: '2026-10-28T12:00:00Z',
    grade: 'F',
    status: 'Critical',
    certificate: {
      subject: 'legacy-billing.internal.org',
      commonName: 'legacy-billing.internal.org',
      issuer: 'Sectigo RSA Domain Validation CA',
      issuerOrg: 'Sectigo Limited',
      validFrom: '2025-11-01T00:00:00Z',
      validTo: '2026-11-01T23:59:59Z',
      daysRemaining: 4,
      status: 'Expiring Soon',
      trustChain: 'Trusted Public CA (Sectigo Root CA)',
      san: ['legacy-billing.internal.org'],
      signatureAlgorithm: 'SHA256withRSA',
      publicKeyAlgorithm: 'RSA (2048 bit)',
      keySizeBits: 2048,
      serialNumber: '55:12:33:AA:91:EE:00:19:42',
      fingerprintSha256: '99:11:44:88:22:33:FF:EE:00:12:45:90:11:32:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55',
      fingerprintSha1: '11:22:33:44:55:66:77:88:99:00:11:22:33:44:55:66:77:88:99:00',
      ocspStapled: false,
      sctCount: 1,
      pemString: `-----BEGIN CERTIFICATE-----
MIIEvDCCA6SgAwIBAgIRALU5m1xS/uQR... [Expiring Leaf Certificate]
-----END CERTIFICATE-----`
    },
    transport: {
      httpRedirect: {
        status: 'Missing',
        code: 200,
        destination: 'http://legacy-billing.internal.org/login',
        plaintextAllowed: true,
        hops: [
          { url: 'http://legacy-billing.internal.org/', status: 200 }
        ]
      },
      tlsNegotiation: {
        protocol: 'TLSv1.2',
        cipherSuite: 'ECDHE-RSA-AES128-SHA256',
        perfectForwardSecrecy: true,
        alpnProtocols: ['http/1.1']
      },
      hsts: {
        status: 'Missing',
        header: null,
        maxAge: null,
        includeSubDomains: false,
        preload: false,
        preloadEligible: false
      }
    },
    findings: [
      {
        id: 'TLS-001',
        ruleId: 'TLS-001',
        title: 'Certificate Imminently Expiring (< 7 Days Remaining)',
        severity: 'Critical',
        kind: 'Vulnerability',
        description: 'The leaf X.509 certificate expires in only 4 days. Unrenewed certificates trigger immediate full-page TLS connection errors across all major browsers, causing catastrophic outage for visitors.',
        evidence: 'Valid To: 2026-11-01T23:59:59Z. Days remaining calculated: 4 days.',
        impact: 'Loss of service, broken payment gateway callbacks, customer trust destruction.',
        standards: ['NIST SP 800-52r2 §3.1', 'CAB Forum Baseline Requirements §6.3.2'],
        remediationPrompts: {
          nextjs: `// Trigger automated renewal via your DNS or Cloud provider (AWS ACM, Cloudflare, or Let's Encrypt Certbot):
// certbot renew --force-renewal`,
          nginx: `# Run Certbot renew hook:
sudo certbot renew --nginx --dry-run
# Ensure auto-renewal cron exists in /etc/cron.d/certbot`,
          apache: `# Renew certificate via Certbot Apache plugin:
sudo certbot renew --apache`,
          caddy: `# Caddy automatically manages renewal in the background when automatic HTTPS is on.
# Restart Caddy to re-sync:
sudo systemctl reload caddy`,
          express: `// Ensure certificate paths are pointed to automated symlinks (e.g., /etc/letsencrypt/live/):
const sslOptions = {
  key: fs.readFileSync('/etc/letsencrypt/live/legacy-billing.internal.org/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/legacy-billing.internal.org/fullchain.pem')
};`,
          cloudflare: `// In Cloudflare Dashboard:
// SSL/TLS > Edge Certificates > Ensure 'Always Use HTTPS' and 'Automatic Certificate Renewal' are toggled ON.`
        }
      },
      {
        id: 'TLS-002',
        ruleId: 'TLS-002',
        title: 'Plaintext HTTP (Port 80) Accessible Without HTTPS Redirect',
        severity: 'Critical',
        kind: 'Vulnerability',
        description: 'The server accepts unencrypted connections on Port 80 and returns HTTP 200 OK without redirecting to HTTPS. Passwords, session cookies, and billing details sent over HTTP are readable in cleartext.',
        evidence: 'GET http://legacy-billing.internal.org/ returned HTTP 200 OK with plaintext body.',
        impact: 'Full plaintext eavesdropping, session hijacking, credential harvesting.',
        standards: ['OWASP ASVS 4.0 §9.1.1', 'PCI-DSS 4.0 Req 4.1.2'],
        remediationPrompts: {
          nextjs: `// Redirect plaintext in Next.js middleware.ts:
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

export function middleware(request: NextRequest) {
  if (request.headers.get('x-forwarded-proto') === 'http') {
    return NextResponse.redirect(\`https://\${request.headers.get('host')}\${request.nextUrl.pathname}\`, 301);
  }
}`,
          nginx: `# Enforce port 80 redirect:
server {
    listen 80;
    server_name legacy-billing.internal.org;
    return 301 https://$host$request_uri;
}`,
          apache: `# In .htaccess:
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]`,
          caddy: `# Caddy automatically redirects HTTP to HTTPS by default.
# Remove any 'http://' prefix from your site block in Caddyfile:
legacy-billing.internal.org {
    reverse_proxy localhost:8080
}`,
          express: `// Express HTTP to HTTPS redirect middleware:
app.use((req, res, next) => {
  if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
    return res.redirect(301, 'https://' + req.get('host') + req.url);
  }
  next();
});`,
          cloudflare: `// In Cloudflare Dashboard:
// SSL/TLS > Edge Certificates > Enable "Always Use HTTPS" (Enforces 301 redirect globally at edge).`
        }
      },
      {
        id: 'TLS-007',
        ruleId: 'TLS-007',
        title: 'Missing Strict-Transport-Security (HSTS) Header',
        severity: 'Medium',
        kind: 'Configuration Defect',
        description: 'No HSTS header is transmitted on secure responses. Browsers cannot remember to bypass Port 80 on future visits.',
        evidence: "Port 443 response header 'strict-transport-security' was not returned.",
        impact: 'Susceptible to SSL stripping attack vectors.',
        standards: ['OWASP WSTG-CONF-07', 'RFC 6797'],
        remediationPrompts: {
          nextjs: `// next.config.js
module.exports = {
  async headers() {
    return [{ source: '/(.*)', headers: [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }] }];
  }
};`,
          nginx: `add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;`,
          apache: `Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"`,
          caddy: `header Strict-Transport-Security "max-age=31536000; includeSubDomains"`,
          express: `app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true }));`,
          cloudflare: `// Rules > Transform Rules > Add Header Strict-Transport-Security`
        }
      }
    ],
    compliance: [
      {
        id: 'comp-1',
        standard: 'OWASP ASVS 4.0',
        section: '9.1.1',
        requirement: 'Enforce TLS for all traffic; redirect plain HTTP.',
        status: 'Fail',
        notes: 'Port 80 serves plaintext 200 OK without redirect.'
      },
      {
        id: 'comp-2',
        standard: 'PCI-DSS 4.0',
        section: 'Req 4.1',
        requirement: 'Strong cryptography and transmission encryption.',
        status: 'Fail',
        notes: 'Plaintext HTTP allows unencrypted credential transfer.'
      }
    ],
    rawHeaders: {
      'server': 'Apache/2.4.41 (Ubuntu)',
      'date': 'Wed, 28 Oct 2026 12:00:00 GMT',
      'content-type': 'text/html; charset=UTF-8',
      'connection': 'close'
    }
  }
};
