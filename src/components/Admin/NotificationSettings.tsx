import React, { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Phone, Settings, Save, TestTube as Test, CheckCircle, AlertCircle, Clock, Users } from 'lucide-react';

interface NotificationSettings {
  emailNotifications: {
    newSubmissions: boolean;
    urgentCases: boolean;
    statusUpdates: boolean;
    followUpReminders: boolean;
    dailyDigest: boolean;
  };
  smsNotifications: {
    urgentCases: boolean;
    highPriority: boolean;
  };
  slackNotifications: {
    newSubmissions: boolean;
    urgentCases: boolean;
    statusUpdates: boolean;
  };
  followUpSchedule: {
    day1: boolean;
    day3: boolean;
    day7: boolean;
    day14: boolean;
  };
  recipients: {
    admin: string;
    urgent: string;
    manager: string;
  };
}

export const NotificationSettings: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: {
      newSubmissions: true,
      urgentCases: true,
      statusUpdates: true,
      followUpReminders: true,
      dailyDigest: false,
    },
    smsNotifications: {
      urgentCases: true,
      highPriority: false,
    },
    slackNotifications: {
      newSubmissions: false,
      urgentCases: false,
      statusUpdates: false,
    },
    followUpSchedule: {
      day1: true,
      day3: true,
      day7: true,
      day14: true,
    },
    recipients: {
      admin: 'admin@repmotivatedseller.org',
      urgent: 'urgent@repmotivatedseller.org',
      manager: 'manager@repmotivatedseller.org',
    },
  });

  const [isSaving, setIsSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSettingChange = (category: keyof NotificationSettings, key: string, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // In a real implementation, you'd save to your backend/database
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmail = async () => {
    setTestingEmail(true);
    try {
      // In a real implementation, you'd trigger a test email
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      alert('Test email sent successfully!');
    } catch (error) {
      alert('Failed to send test email');
    } finally {
      setTestingEmail(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Settings className="w-6 h-6 text-gray-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Notification Settings</h2>
          </div>
          <div className="flex items-center space-x-3">
            {saveStatus === 'success' && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="text-sm">Settings saved</span>
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="flex items-center text-red-600">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span className="text-sm">Save failed</span>
              </div>
            )}
            <button
              onClick={handleTestEmail}
              disabled={testingEmail}
              className="flex items-center px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <Test className="w-4 h-4 mr-2" />
              {testingEmail ? 'Sending...' : 'Test Email'}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Email Notifications */}
        <div>
          <div className="flex items-center mb-4">
            <Mail className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Email Notifications</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(settings.emailNotifications).map(([key, value]) => (
              <label key={key} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handleSettingChange('emailNotifications', key, e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-sm font-medium text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* SMS Notifications */}
        <div>
          <div className="flex items-center mb-4">
            <Phone className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">SMS Notifications</h3>
            <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
              Requires Twilio Setup
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(settings.smsNotifications).map(([key, value]) => (
              <label key={key} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handleSettingChange('smsNotifications', key, e.target.checked)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="ml-3 text-sm font-medium text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Slack Notifications */}
        <div>
          <div className="flex items-center mb-4">
            <MessageSquare className="w-5 h-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Slack Notifications</h3>
            <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
              Requires Webhook URL
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(settings.slackNotifications).map(([key, value]) => (
              <label key={key} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handleSettingChange('slackNotifications', key, e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="ml-3 text-sm font-medium text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Follow-up Schedule */}
        <div>
          <div className="flex items-center mb-4">
            <Clock className="w-5 h-5 text-orange-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Automated Follow-up Schedule</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(settings.followUpSchedule).map(([key, value]) => (
              <label key={key} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handleSettingChange('followUpSchedule', key, e.target.checked)}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="ml-3 text-sm font-medium text-gray-700">
                  {key.replace('day', 'Day ')}
                </span>
              </label>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Automatic follow-up reminders will be sent to the admin team on the selected days after submission.
          </p>
        </div>

        {/* Email Recipients */}
        <div>
          <div className="flex items-center mb-4">
            <Users className="w-5 h-5 text-indigo-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Email Recipients</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(settings.recipients).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {key} Email
                </label>
                <input
                  type="email"
                  value={value}
                  onChange={(e) => handleSettingChange('recipients', key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`${key}@repmotivatedseller.org`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Integration Status */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Integration Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <span className="text-sm font-medium text-gray-700">MailerLite</span>
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <span className="text-sm font-medium text-gray-700">CRM Integration</span>
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <span className="text-sm font-medium text-gray-700">SMS Service</span>
              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                Setup Required
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};