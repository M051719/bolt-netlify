import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  ExternalLink,
  Copy,
  Shield,
  Mail,
  Server,
  Cloud,
  Settings,
  Info
} from 'lucide-react';

interface DNSRecord {
  type: string;
  name: string;
  value: string;
  ttl: number;
  priority?: number;
  status: 'verified' | 'pending' | 'error' | 'missing';
  description: string;
  required: boolean;
}

interface DNSVerificationResult {
  domain: string;
  status: 'active' | 'pending' | 'error';
  records: DNSRecord[];
  cloudflareStatus: 'active' | 'pending' | 'error';
  sslStatus: 'active' | 'pending' | 'error';
  nameservers: string[];
}

export const DNSVerification: React.FC = () => {
  const [verificationResult, setVerificationResult] = useState<DNSVerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'records' | 'setup' | 'troubleshoot'>('overview');

  const requiredDNSRecords: DNSRecord[] = [
    {
      type: 'A',
      name: '@',
      value: '35.204.112.174',
      ttl: 300,
      status: 'pending',
      description: 'Main domain pointing to your server',
      required: true
    },
    {
      type: 'A',
      name: 'www',
      value: '35.204.112.174',
      ttl: 300,
      status: 'pending',
      description: 'WWW subdomain pointing to your server',
      required: true
    },
    {
      type: 'CNAME',
      name: 'admin',
      value: 'repmotivatedseller.org',
      ttl: 300,
      status: 'pending',
      description: 'Admin dashboard subdomain',
      required: false
    },
    {
      type: 'CNAME',
      name: 'api',
      value: 'repmotivatedseller.org',
      ttl: 300,
      status: 'pending',
      description: 'API endpoint subdomain',
      required: false
    },
    {
      type: 'TXT',
      name: '@',
      value: 'v=spf1 include:_spf.google.com ~all',
      ttl: 300,
      status: 'pending',
      description: 'SPF record for email security',
      required: true
    },
    {
      type: 'TXT',
      name: '_dmarc',
      value: 'v=DMARC1; p=quarantine; rua=mailto:dmarc@repmotivatedseller.org',
      ttl: 300,
      status: 'pending',
      description: 'DMARC record for email security',
      required: true
    },
    {
      type: 'MX',
      name: '@',
      value: 'mail.repmotivatedseller.org',
      ttl: 300,
      priority: 10,
      status: 'pending',
      description: 'Mail exchange record for email',
      required: false
    }
  ];

  useEffect(() => {
    runDNSVerification();
  }, []);

  const runDNSVerification = async () => {
    setIsVerifying(true);
    
    try {
      // Simulate DNS verification checks
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock verification results
      const mockResult: DNSVerificationResult = {
        domain: 'repmotivatedseller.org',
        status: 'active',
        cloudflareStatus: 'active',
        sslStatus: 'active',
        nameservers: [
          'ava.ns.cloudflare.com',
          'beau.ns.cloudflare.com'
        ],
        records: requiredDNSRecords.map(record => ({
          ...record,
          status: Math.random() > 0.3 ? 'verified' : 'pending'
        }))
      };
      
      setVerificationResult(mockResult);
    } catch (error) {
      console.error('DNS verification failed:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'error':
      case 'missing':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <RefreshCw className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
      case 'active':
        return 'border-green-200 bg-green-50';
      case 'pending':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
      case 'missing':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Globe className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">DNS & Domain Verification</h2>
              <p className="text-gray-600 mt-1">Cloudflare configuration for repmotivatedseller.org</p>
            </div>
          </div>
          <button
            onClick={runDNSVerification}
            disabled={isVerifying}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isVerifying ? 'animate-spin' : ''}`} />
            {isVerifying ? 'Verifying...' : 'Verify DNS'}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Overview', icon: Globe },
            { id: 'records', label: 'DNS Records', icon: Server },
            { id: 'setup', label: 'Setup Guide', icon: Settings },
            { id: 'troubleshoot', label: 'Troubleshoot', icon: AlertTriangle }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-6">
        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {verificationResult && (
              <>
                {/* Domain Status */}
                <div className={`p-4 rounded-lg border ${getStatusColor(verificationResult.status)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getStatusIcon(verificationResult.status)}
                      <div className="ml-3">
                        <h3 className="font-semibold text-gray-900">Domain Status</h3>
                        <p className="text-sm text-gray-600">{verificationResult.domain}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      verificationResult.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {verificationResult.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Service Status Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-lg border ${getStatusColor(verificationResult.cloudflareStatus)}`}>
                    <div className="flex items-center">
                      <Cloud className="w-8 h-8 text-orange-500 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">Cloudflare</h4>
                        <p className="text-sm text-gray-600 capitalize">{verificationResult.cloudflareStatus}</p>
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border ${getStatusColor(verificationResult.sslStatus)}`}>
                    <div className="flex items-center">
                      <Shield className="w-8 h-8 text-green-500 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">SSL Certificate</h4>
                        <p className="text-sm text-gray-600 capitalize">{verificationResult.sslStatus}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
                    <div className="flex items-center">
                      <Mail className="w-8 h-8 text-blue-500 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">Email Security</h4>
                        <p className="text-sm text-gray-600">SPF & DMARC</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Nameservers */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Cloudflare Nameservers</h4>
                  <div className="space-y-2">
                    {verificationResult.nameservers.map((ns, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-3 rounded border">
                        <span className="font-mono text-sm">{ns}</span>
                        <button
                          onClick={() => copyToClipboard(ns)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* DNS Records Tab */}
        {selectedTab === 'records' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Required DNS Records</h3>
              <a
                href="https://dash.cloudflare.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Open Cloudflare Dashboard
              </a>
            </div>

            <div className="space-y-3">
              {requiredDNSRecords.map((record, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getStatusColor(record.status)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        {getStatusIcon(record.status)}
                        <span className="ml-2 font-medium text-gray-900">{record.type} Record</span>
                        {record.required && (
                          <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                            Required
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Name:</span>
                          <div className="font-mono bg-gray-100 p-2 rounded mt-1">{record.name}</div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Value:</span>
                          <div className="font-mono bg-gray-100 p-2 rounded mt-1 break-all">{record.value}</div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">TTL:</span>
                          <div className="font-mono bg-gray-100 p-2 rounded mt-1">{record.ttl}</div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-2">{record.description}</p>
                    </div>
                    
                    <button
                      onClick={() => copyToClipboard(`${record.type} ${record.name} ${record.value}`)}
                      className="ml-4 text-blue-600 hover:text-blue-700"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Setup Guide Tab */}
        {selectedTab === 'setup' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Cloudflare Setup for repmotivatedseller.org</h4>
                  <p className="text-blue-800 text-sm mt-1">
                    Follow these steps to configure your domain with Cloudflare DNS
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">Step 1: Add Domain to Cloudflare</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>Log in to your Cloudflare dashboard</li>
                  <li>Click "Add a Site" and enter: <code className="bg-gray-100 px-2 py-1 rounded">repmotivatedseller.org</code></li>
                  <li>Select the Free plan (or your preferred plan)</li>
                  <li>Cloudflare will scan your existing DNS records</li>
                </ol>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">Step 2: Configure DNS Records</h4>
                <p className="text-sm text-gray-700 mb-3">Add these DNS records in your Cloudflare dashboard:</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-3 text-sm font-mono">
                    <div>A @ 35.204.112.174</div>
                    <div>A www 35.204.112.174</div>
                    <div>CNAME admin repmotivatedseller.org</div>
                    <div>CNAME api repmotivatedseller.org</div>
                    <div>TXT @ "v=spf1 include:_spf.google.com ~all"</div>
                    <div>TXT _dmarc "v=DMARC1; p=quarantine; rua=mailto:dmarc@repmotivatedseller.org"</div>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">Step 3: Update Nameservers</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>Copy the Cloudflare nameservers provided</li>
                  <li>Go to your domain registrar (where you bought the domain)</li>
                  <li>Replace the existing nameservers with Cloudflare's nameservers</li>
                  <li>Save the changes (propagation can take 24-48 hours)</li>
                </ol>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">Step 4: Configure SSL/TLS</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>In Cloudflare dashboard, go to SSL/TLS tab</li>
                  <li>Set encryption mode to "Full (strict)" for maximum security</li>
                  <li>Enable "Always Use HTTPS" under Edge Certificates</li>
                  <li>Enable "Automatic HTTPS Rewrites"</li>
                </ol>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">Step 5: Configure Security Settings</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>Go to Security tab in Cloudflare</li>
                  <li>Set Security Level to "Medium" or "High"</li>
                  <li>Enable "Bot Fight Mode" for basic bot protection</li>
                  <li>Configure firewall rules if needed</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Troubleshoot Tab */}
        {selectedTab === 'troubleshoot' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Common DNS Issues & Solutions</h3>
            
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2">🚨 Domain Not Resolving</h4>
                <div className="text-sm text-red-800 space-y-2">
                  <p><strong>Symptoms:</strong> Website not loading, DNS errors</p>
                  <p><strong>Solutions:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Check if nameservers are correctly updated at your registrar</li>
                    <li>Wait 24-48 hours for DNS propagation</li>
                    <li>Verify A records point to correct IP: 35.204.112.174</li>
                    <li>Use DNS checker tools like whatsmydns.net</li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">⚠️ SSL Certificate Issues</h4>
                <div className="text-sm text-yellow-800 space-y-2">
                  <p><strong>Symptoms:</strong> "Not Secure" warning, SSL errors</p>
                  <p><strong>Solutions:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Ensure SSL/TLS mode is set to "Full (strict)"</li>
                    <li>Enable "Always Use HTTPS"</li>
                    <li>Clear browser cache and cookies</li>
                    <li>Wait for SSL certificate provisioning (up to 24 hours)</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Email Delivery Issues</h4>
                <div className="text-sm text-blue-800 space-y-2">
                  <p><strong>Symptoms:</strong> Emails going to spam, delivery failures</p>
                  <p><strong>Solutions:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Verify SPF record is correctly configured</li>
                    <li>Add DMARC record for email authentication</li>
                    <li>Consider adding DKIM records</li>
                    <li>Test email deliverability with mail-tester.com</li>
                  </ul>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">✅ Performance Optimization</h4>
                <div className="text-sm text-green-800 space-y-2">
                  <p><strong>Recommendations:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Enable Cloudflare caching for static assets</li>
                    <li>Use "Auto Minify" for CSS, JS, and HTML</li>
                    <li>Enable "Brotli" compression</li>
                    <li>Set appropriate TTL values (300 seconds for testing, 3600+ for production)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">DNS Testing Tools</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a
                  href="https://whatsmydns.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-white rounded border hover:bg-gray-50"
                >
                  <ExternalLink className="w-4 h-4 mr-2 text-blue-600" />
                  <span>whatsmydns.net - Global DNS propagation checker</span>
                </a>
                <a
                  href="https://dnschecker.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-white rounded border hover:bg-gray-50"
                >
                  <ExternalLink className="w-4 h-4 mr-2 text-blue-600" />
                  <span>dnschecker.org - DNS record lookup</span>
                </a>
                <a
                  href="https://mxtoolbox.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-white rounded border hover:bg-gray-50"
                >
                  <ExternalLink className="w-4 h-4 mr-2 text-blue-600" />
                  <span>mxtoolbox.com - Email and DNS testing</span>
                </a>
                <a
                  href="https://www.ssllabs.com/ssltest/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-white rounded border hover:bg-gray-50"
                >
                  <ExternalLink className="w-4 h-4 mr-2 text-blue-600" />
                  <span>SSL Labs - SSL certificate testing</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};