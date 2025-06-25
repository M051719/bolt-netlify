import React, { useState } from 'react';
import { FileText, Home, DollarSign, Wrench, TrendingUp, Building2 } from 'lucide-react';
import { WholesaleContractForm } from '../components/Contracts/WholesaleContractForm';
import { FixFlipContractForm } from '../components/Contracts/FixFlipContractForm';
import { CashoutRefiForm } from '../components/Contracts/CashoutRefiForm';

type ContractType = 'wholesale' | 'fix-flip' | 'cashout-refi';

export const ContractsPage: React.FC = () => {
  const [selectedContract, setSelectedContract] = useState<ContractType | null>(null);

  const contractTypes = [
    {
      id: 'wholesale' as ContractType,
      title: 'Wholesale Real Estate Contract',
      description: 'Professional wholesale purchase agreements with assignment rights and $10,000+ fee protection',
      icon: FileText,
      color: 'blue',
      features: [
        'Minimum $10,000 wholesale fee protection',
        'Full assignment rights without seller consent',
        'Comprehensive legal protections',
        'State-compliant disclosures',
        'Professional contract language'
      ]
    },
    {
      id: 'fix-flip' as ContractType,
      title: 'Fix-and-Flip Purchase Agreement',
      description: 'Investment property contracts with renovation provisions and market analysis',
      icon: Wrench,
      color: 'purple',
      features: [
        'Renovation cost and timeline provisions',
        'After Repair Value (ARV) analysis',
        'Investment protection clauses',
        'Contractor and permit requirements',
        'Market condition assessments'
      ]
    },
    {
      id: 'cashout-refi' as ContractType,
      title: 'Cash-Out Refinance Application',
      description: 'Comprehensive mortgage refinance documentation with cash-out provisions',
      icon: TrendingUp,
      color: 'green',
      features: [
        'Complete borrower financial profile',
        'Loan-to-value calculations',
        'Cash-out purpose documentation',
        'Lender qualification requirements',
        'Regulatory compliance disclosures'
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-900',
        button: 'bg-blue-600 hover:bg-blue-700',
        icon: 'text-blue-600'
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-900',
        button: 'bg-purple-600 hover:bg-purple-700',
        icon: 'text-purple-600'
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-900',
        button: 'bg-green-600 hover:bg-green-700',
        icon: 'text-green-600'
      }
    };
    return colors[color as keyof typeof colors];
  };

  if (selectedContract === 'wholesale') {
    return <WholesaleContractForm />;
  }

  if (selectedContract === 'fix-flip') {
    return <FixFlipContractForm />;
  }

  if (selectedContract === 'cashout-refi') {
    return <CashoutRefiForm />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Building2 className="w-12 h-12 text-blue-600 mr-4" />
            <h1 className="text-4xl font-bold text-gray-900">
              Professional Real Estate Contracts
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Generate production-ready legal documents with comprehensive protections, 
            regulatory compliance, and professional-grade contract language
          </p>
        </div>

        {/* Contract Type Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {contractTypes.map((contract) => {
            const Icon = contract.icon;
            const colors = getColorClasses(contract.color);
            
            return (
              <div
                key={contract.id}
                className={`${colors.bg} ${colors.border} border-2 rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:scale-105`}
              >
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 ${colors.bg} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <Icon className={`w-8 h-8 ${colors.icon}`} />
                  </div>
                  <h3 className={`text-2xl font-bold ${colors.text} mb-2`}>
                    {contract.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {contract.description}
                  </p>
                </div>

                <div className="space-y-3 mb-8">
                  {contract.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <div className={`w-2 h-2 ${colors.button.split(' ')[0]} rounded-full mt-2 mr-3 flex-shrink-0`} />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setSelectedContract(contract.id)}
                  className={`w-full ${colors.button} text-white py-3 px-6 rounded-lg font-medium transition-colors shadow-lg`}
                >
                  Create {contract.title.split(' ')[0]} Contract
                </button>
              </div>
            );
          })}
        </div>

        {/* Features Overview */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Professional Contract Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Legal Compliance</h3>
              <p className="text-gray-600 text-sm">
                All contracts meet state and federal regulatory requirements with proper disclosures
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Financial Protection</h3>
              <p className="text-gray-600 text-sm">
                Comprehensive fee protection and financial safeguards for all parties
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Property Specific</h3>
              <p className="text-gray-600 text-sm">
                Tailored clauses for different property types and investment strategies
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Professional Grade</h3>
              <p className="text-gray-600 text-sm">
                Industry-standard language suitable for professional real estate transactions
              </p>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center mr-3 mt-0.5">
              <span className="text-white text-sm font-bold">!</span>
            </div>
            <div>
              <h4 className="font-semibold text-yellow-900 mb-2">Important Legal Notice</h4>
              <p className="text-yellow-800 text-sm">
                These contract templates are provided for informational purposes only and do not constitute legal advice. 
                Laws vary by state and locality. It is strongly recommended that you consult with a qualified real estate 
                attorney in your jurisdiction before using any of these agreements. RepMotivatedSeller assumes no liability 
                for the use of these templates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};