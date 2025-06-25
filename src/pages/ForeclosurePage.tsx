import React from 'react';
import { ForeclosureQuestionnaire } from '../components/Forms/ForeclosureQuestionnaire';
import { DollarSign, AlertTriangle, CheckCircle, Home } from 'lucide-react';

export const ForeclosurePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Financing Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <DollarSign className="w-10 h-10 text-yellow-300 mx-auto mb-3" />
            <h2 className="text-xl font-bold mb-2">
              🏦 Financing Solutions Available Through RepMotivatedSeller
            </h2>
            <p className="text-blue-100 mb-4">
              Private money loans for investment properties • Non-owner occupied only • Borrower entity required
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-white/10 rounded-lg p-3">
                <div className="font-semibold text-sm">Loan Amount</div>
                <div className="text-yellow-200 text-sm">$30K - FHA Cap</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="font-semibold text-sm">Rate</div>
                <div className="text-yellow-200 text-sm">8% - 15%</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="font-semibold text-sm">Term</div>
                <div className="text-yellow-200 text-sm">6-24 Months</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="font-semibold text-sm">Purpose</div>
                <div className="text-yellow-200 text-sm">Investment Only</div>
              </div>
            </div>

            <div className="mt-4 bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-3 max-w-4xl mx-auto">
              <div className="flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-yellow-300 mr-2" />
                <span className="text-sm text-yellow-200">
                  Available in 36 states • Excludes: MN, NV, SD, UT, VT • Broker fees subject to underwriting
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ForeclosureQuestionnaire />
    </div>
  );
};