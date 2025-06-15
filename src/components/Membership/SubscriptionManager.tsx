import React, { useState } from 'react';
import { CreditCard, Calendar, AlertCircle, ExternalLink } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { createPortalSession } from '../../lib/stripe';

export const SubscriptionManager: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();

  const handleManageSubscription = async () => {
    if (!user?.stripeCustomerId) {
      alert('No subscription found');
      return;
    }

    setIsLoading(true);

    try {
      const session = await createPortalSession(user.stripeCustomerId);
      window.open(session.url, '_blank');
    } catch (error) {
      console.error('Error creating portal session:', error);
      alert('Failed to open subscription management. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || user.membershipTier === 'free') {
    return null;
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'past_due':
        return 'text-yellow-600 bg-yellow-100';
      case 'canceled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Subscription Details</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(user.subscriptionStatus)}`}>
          {user.subscriptionStatus || 'Active'}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <CreditCard className="w-5 h-5 text-gray-400 mr-3" />
          <div>
            <p className="font-medium text-gray-900">Current Plan</p>
            <p className="text-gray-600 capitalize">{user.membershipTier}</p>
          </div>
        </div>

        <div className="flex items-center">
          <Calendar className="w-5 h-5 text-gray-400 mr-3" />
          <div>
            <p className="font-medium text-gray-900">Billing Cycle</p>
            <p className="text-gray-600">Monthly</p>
          </div>
        </div>

        {user.subscriptionStatus === 'past_due' && (
          <div className="flex items-start p-4 bg-yellow-50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800">Payment Required</p>
              <p className="text-yellow-700 text-sm">
                Your subscription payment is past due. Please update your payment method.
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleManageSubscription}
          disabled={isLoading}
          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          {isLoading ? 'Loading...' : 'Manage Subscription'}
        </button>
      </div>
    </div>
  );
};