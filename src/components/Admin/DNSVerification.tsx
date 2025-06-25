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
  Info,
  AlertCircle
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
  proxyStatus?: 'proxied' | 'dns-only';
}

interface DNSVerificationResult {
  domain: string;
  status: 'active' | 'pending' | 'error' | 'not-configured';
  records: DNSRecord[];
  cloudflareStatus: 'active' | 'pending' | 'error' | 'not-configured';
  sslStatus: 'active' | 'pending' | 'error' | 'not-configured';
  nameservers: string[];
  issues: string[];
}

export const DNSVerification: React.FC = () => {
  const [verificationResult, setVerificationResult] = useState<DNSVerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'records' | 'setup' | 'troubleshoot'>('overview');
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const requiredDNSRecords: DNSRecord[] = [
    {
      type: 'A',
      name: '@',
      value: '35.204.112.174',
      ttl: 300,
      status: 'missing',
      description: 'Main domain pointing to your server (repmotivatedseller.org)',
      required: true,
      proxyStatus: 'proxied'
    },
    {
      type: 'A',
      name: 'www',
      value: '35.204.112.174',
      ttl: 300,
      status: 'missing',
      description: 'WWW subdomain pointing to your server (www.repmotivatedseller.org)',
      required: true,
      proxyStatus: 'proxied'
    },
    {
      type: 'CNAME',
      name: 'admin',
      value: 'repmotivatedseller.org',
      ttl: 300,
      status: 'missing',
      description: 'Admin dashboard subdomain (admin.repmotivatedseller.org)',
      required: false,
      proxyStatus: 'proxied'
    },
    {
      type: 'CNAME',
      name: 'api',
      value: 'repmotivatedseller.org',
      ttl: 300,
      status: 'missing',
      description: 'API endpoint subdomain (api.repmotivatedseller.org)',
      required: false,
      proxyStatus: 'proxied'
    },
    {
      type: 'TXT',
      name: '@',
      value: 'v=spf1 include:_spf.google.com ~all',
      ttl: 300,
      status: 'missing',
      description: 'SPF record for email security and deliverability',
      required: true,
      proxyStatus: 'dns-only'
    },
    {
      type: 'TXT',
      name: '_dmarc',
      value: 'v=DMARC1; p=quarantine; rua=mailto:dmarc@repmotivatedseller.org',
      ttl: 300,
      status: 'missing',
      description: 'DMARC record for email authentication and anti-spoofing',
      required: true,
      proxyStatus: 'dns-only'
    },
    {
      type: 'MX',
      name: '@',
      value: 'mail.repmotivatedseller.org',
      ttl: 300,
      priority: 10,
      status: 'missing',
      description: 'Mail exchange record for receiving emails',
      required: false,
      proxyStatus: 'dns-only'
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
      
      // Since records are not found, set status as not-configured
      const mockResult: DNSVerificationResult = {
        domain: 'repmotivatedseller.org',
        status: 'not-configured',
        cloudflareStatus: 'not-configured',
        sslStatus: 'not-configured',
        nameservers: [
          'ava.ns.cloudflare.com',
          'beau.ns.cloudflare.com'
        ],
        records: requiredDNSRecords.map(record => ({
          ...record,
          status: 'missing'
        })),
        issues: [
          'Domain not found in Cloudflare',
          'DNS records not configured',
          'Nameservers not updated',
          'SSL certificate not provisioned'
        ]
      };
      
      setVerificationResult(mockResult);
    } catch (error) {
      console.error('DNS verification failed:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(label);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
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
      case 'not-configured':
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
      case 'not-configured':
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
              <h2 className="text-xl font-semibold text-gray-900">DNS & Domain Configuration</h2>
              <p className="text-gray-600 mt-1">Cloudflare setup for repmotivatedseller.org</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <a
              href="https://dash.cloudflare.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Cloud className="w-4 h-4 mr-2" />
              Open Cloudflare
            </a>
            <button
              onClick={runDNSVerification}
              disabled={isVerifying}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isVerifying ? 'animate-spin' : ''}`} />
              {isVerifying ? 'Checking...' : 'Check DNS'}
            </button>
          </div>
        </div>
      </div>

      {/* Critical Alert */}
      {verificationResult?.status === 'not-configured' && (
        <div className="mx-6 mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 text-red-600 mr-3 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">🚨 DNS Configuration Required</h3>
              <p className="text-red-800 text-sm mt-1">
                Your domain <strong>repmotivatedseller.org</strong> is not configured in Cloudflare. 
                Follow the setup guide below to configure DNS records.
              </p>
              <div className="mt-3">
                <button
                  onClick={() => setSelectedTab('setup')}
                  className="text-red-700 hover:text-red-900 font-medium text-sm underline"
                >
                  → View Complete Setup Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                        : verificationResult.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {verificationResult.status === 'not-configured' ? 'NOT CONFIGURED' : verificationResult.status.toUpperCase()}
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
                        <p className="text-sm text-gray-600 capitalize">
                          {verificationResult.cloudflareStatus === 'not-configured' ? 'Not Setup' : verificationResult.cloudflareStatus}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border ${getStatusColor(verificationResult.sslStatus)}`}>
                    <div className="flex items-center">
                      <Shield className="w-8 h-8 text-green-500 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">SSL Certificate</h4>
                        <p className="text-sm text-gray-600 capitalize">
                          {verificationResult.sslStatus === 'not-configured' ? 'Not Available' : verificationResult.sslStatus}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-red-200 bg-red-50">
                    <div className="flex items-center">
                      <Mail className="w-8 h-8 text-red-500 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">Email Security</h4>
                        <p className="text-sm text-gray-600">Not Configured</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Issues List */}
                {verificationResult.issues.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-900 mb-3">🔧 Issues Found</h4>
                    <ul className="space-y-2">
                      {verificationResult.issues.map((issue, index) => (
                        <li key={index} className="flex items-center text-sm text-red-800">
                          <XCircle className="w-4 h-4 mr-2 text-red-600" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-3">🚀 Quick Actions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <a
                      href="https://dash.cloudflare.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 bg-white rounded border hover:bg-gray-50"
                    >
                      <ExternalLink className="w-4 h-4 mr-2 text-blue-600" />
                      <span>Add Domain to Cloudflare</span>
                    </a>
                    <button
                      onClick={() => setSelectedTab('setup')}
                      className="flex items-center p-3 bg-white rounded border hover:bg-gray-50"
                    >
                      <Settings className="w-4 h-4 mr-2 text-blue-600" />
                      <span>View Setup Instructions</span>
                    </button>
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
              <div className="flex items-center space-x-2">
                {copySuccess && (
                  <span className="text-green-600 text-sm">✓ {copySuccess} copied!</span>
                )}
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
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900">Configuration Required</h4>
                  <p className="text-yellow-800 text-sm mt-1">
                    These DNS records need to be added to your Cloudflare dashboard. Copy each record and add them manually.
                  </p>
                </div>
              </div>
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
                        {record.proxyStatus && (
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                            record.proxyStatus === 'proxied' 
                              ? 'bg-orange-100 text-orange-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {record.proxyStatus === 'proxied' ? '🟠 Proxied' : '⚪ DNS Only'}
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Name:</span>
                          <div className="font-mono bg-gray-100 p-2 rounded mt-1 flex items-center justify-between">
                            <span>{record.name}</span>
                            <button
                              onClick={() => copyToClipboard(record.name, 'Name')}
                              className="text-blue-600 hover:text-blue-700 ml-2"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Value:</span>
                          <div className="font-mono bg-gray-100 p-2 rounded mt-1 break-all flex items-center justify-between">
                            <span className="flex-1">{record.value}</span>
                            <button
                              onClick={() => copyToClipboard(record.value, 'Value')}
                              className="text-blue-600 hover:text-blue-700 ml-2"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">TTL:</span>
                          <div className="font-mono bg-gray-100 p-2 rounded mt-1">{record.ttl}</div>
                        </div>
                      </div>
                      
                      {record.priority && (
                        <div className="mt-2">
                          <span className="font-medium text-gray-600 text-sm">Priority: </span>
                          <span className="font-mono text-sm">{record.priority}</span>
                        </div>
                      )}
                      
                      <p className="text-sm text-gray-600 mt-2">{record.description}</p>
                    </div>
                    
                    <button
                      onClick={() => copyToClipboard(`${record.type} ${record.name} ${record.value}`, 'Full Record')}
                      className="ml-4 text-blue-600 hover:text-blue-700 p-2 rounded hover:bg-blue-50"
                      title="Copy full record"
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
                  <h4 className="font-medium text-blue-900">Complete Cloudflare Setup Guide</h4>
                  <p className="text-blue-800 text-sm mt-1">
                    Follow these steps to configure repmotivatedseller.org with Cloudflare DNS
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">Step 1: Add Domain to Cloudflare</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>Go to <a href="https://dash.cloudflare.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Cloudflare Dashboard</a></li>
                  <li>Click "Add a Site" and enter: <code className="bg-gray-100 px-2 py-1 rounded font-mono">repmotivatedseller.org</code></li>
                  <li>Select the Free plan (or your preferred plan)</li>
                  <li>Cloudflare will scan your existing DNS records</li>
                </ol>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">Step 2: Configure DNS Records</h4>
                <p className="text-sm text-gray-700 mb-3">Add these DNS records in your Cloudflare dashboard:</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2 text-sm font-mono">
                    <div className="flex items-center justify-between bg-white p-2 rounded border">
                      <span>A @ 35.204.112.174 (Proxied)</span>
                      <button
                        onClick={() => copyToClipboard('A @ 35.204.112.174', 'A Record')}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between bg-white p-2 rounded border">
                      <span>A www 35.204.112.174 (Proxied)</span>
                      <button
                        onClick={() => copyToClipboard('A www 35.204.112.174', 'WWW A Record')}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between bg-white p-2 rounded border">
                      <span>CNAME admin repmotivatedseller.org (Proxied)</span>
                      <button
                        onClick={() => copyToClipboard('CNAME admin repmotivatedseller.org', 'Admin CNAME')}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between bg-white p-2 rounded border">
                      <span>TXT @ "v=spf1 include:_spf.google.com ~all"</span>
                      <button
                        onClick={() => copyToClipboard('v=spf1 include:_spf.google.com ~all', 'SPF Record')}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">Step 3: Update Nameservers</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>Copy the Cloudflare nameservers provided (usually *.ns.cloudflare.com)</li>
                  <li>Go to your domain registrar (where you bought repmotivatedseller.org)</li>
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
                <h4 className="font-semibold text-gray-900 mb-2">Step 5: Verify Configuration</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>Wait for DNS propagation (up to 48 hours)</li>
                  <li>Test domain resolution: <code className="bg-gray-100 px-2 py-1 rounded">repmotivatedseller.org</code></li>
                  <li>Verify SSL certificate is active</li>
                  <li>Check all subdomains are working</li>
                </ol>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">✅ Expected Results</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• repmotivatedseller.org resolves to your application</li>
                <li>• www.repmotivatedseller.org works properly</li>
                <li>• admin.repmotivatedseller.org accessible</li>
                <li>• SSL certificate with A+ rating</li>
                <li>• Email security (SPF/DMARC) configured</li>
              </ul>
            </div>
          </div>
        )}

        {/* Troubleshoot Tab */}
        {selectedTab === 'troubleshoot' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">DNS Troubleshooting & Testing Tools</h3>
            
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2">🚨 Records Not Found</h4>
                <div className="text-sm text-red-800 space-y-2">
                  <p><strong>Current Issue:</strong> DNS records are not configured in Cloudflare</p>
                  <p><strong>Solutions:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Add domain to Cloudflare first</li>
                    <li>Configure all required DNS records manually</li>
                    <li>Update nameservers at your domain registrar</li>
                    <li>Wait 24-48 hours for DNS propagation</li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Common Setup Issues</h4>
                <div className="text-sm text-yellow-800 space-y-2">
                  <p><strong>Symptoms:</strong> Domain not resolving, SSL errors</p>
                  <p><strong>Solutions:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Verify nameservers are updated at registrar</li>
                    <li>Check DNS record syntax and values</li>
                    <li>Ensure proxy status is correct (orange cloud for A/CNAME)</li>
                    <li>Wait for SSL certificate provisioning</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Verification Steps</h4>
                <div className="text-sm text-blue-800 space-y-2">
                  <p><strong>After configuration:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Use DNS propagation checkers</li>
                    <li>Test SSL certificate with SSL Labs</li>
                    <li>Verify email security records</li>
                    <li>Check website accessibility</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">DNS Testing Tools</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a
                  href="https://whatsmydns.net/#A/repmotivatedseller.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-white rounded border hover:bg-gray-50"
                >
                  <ExternalLink className="w-4 h-4 mr-2 text-blue-600" />
                  <span>Check DNS Propagation</span>
                </a>
                <a
                  href="https://dnschecker.org/#A/repmotivatedseller.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-white rounded border hover:bg-gray-50"
                >
                  <ExternalLink className="w-4 h-4 mr-2 text-blue-600" />
                  <span>DNS Record Lookup</span>
                </a>
                <a
                  href="https://www.ssllabs.com/ssltest/analyze.html?d=repmotivatedseller.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-white rounded border hover:bg-gray-50"
                >
                  <ExternalLink className="w-4 h-4 mr-2 text-blue-600" />
                  <span>SSL Certificate Test</span>
                </a>
                <a
                  href="https://mxtoolbox.com/domain/repmotivatedseller.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-white rounded border hover:bg-gray-50"
                >
                  <ExternalLink className="w-4 h-4 mr-2 text-blue-600" />
                  <span>Email & DNS Testing</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};