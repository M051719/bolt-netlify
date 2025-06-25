import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Save, 
  User, 
  Home, 
  DollarSign, 
  Calendar, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  Building,
  Percent,
  Clock,
  Scale
} from 'lucide-react';

interface ContractData {
  // Seller Information
  sellerName: string;
  sellerAddress: string;
  sellerCity: string;
  sellerState: string;
  sellerZip: string;
  sellerPhone: string;
  sellerEmail: string;
  
  // Buyer/Wholesaler Information
  buyerName: string;
  buyerAddress: string;
  buyerCity: string;
  buyerState: string;
  buyerZip: string;
  buyerPhone: string;
  buyerEmail: string;
  
  // Property Information
  propertyAddress: string;
  propertyCity: string;
  propertyState: string;
  propertyZip: string;
  propertyType: string;
  legalDescription: string;
  parcelNumber: string;
  
  // Financial Terms
  purchasePrice: string;
  earnestMoney: string;
  wholesaleFee: string;
  feeType: 'fixed' | 'percentage';
  feePercentage: string;
  
  // Contract Terms
  inspectionPeriod: string;
  closingDate: string;
  contingencies: string[];
  additionalTerms: string;
  
  // Assignment Information
  assignmentFee: string;
  assigneeRights: boolean;
  
  // Legal Protections
  disclosures: string[];
  warranties: string[];
}

const initialContractData: ContractData = {
  sellerName: '',
  sellerAddress: '',
  sellerCity: '',
  sellerState: '',
  sellerZip: '',
  sellerPhone: '',
  sellerEmail: '',
  buyerName: '',
  buyerAddress: '',
  buyerCity: '',
  buyerState: '',
  buyerZip: '',
  buyerPhone: '',
  buyerEmail: '',
  propertyAddress: '',
  propertyCity: '',
  propertyState: '',
  propertyZip: '',
  propertyType: 'single-family',
  legalDescription: '',
  parcelNumber: '',
  purchasePrice: '',
  earnestMoney: '',
  wholesaleFee: '10000',
  feeType: 'fixed',
  feePercentage: '5',
  inspectionPeriod: '10',
  closingDate: '',
  contingencies: [],
  additionalTerms: '',
  assignmentFee: '',
  assigneeRights: true,
  disclosures: [],
  warranties: []
};

export const WholesaleContractForm: React.FC = () => {
  const [contractData, setContractData] = useState<ContractData>(initialContractData);
  const [currentSection, setCurrentSection] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const sections = [
    { title: 'Seller Information', icon: User, color: 'blue' },
    { title: 'Buyer Information', icon: User, color: 'green' },
    { title: 'Property Details', icon: Home, color: 'purple' },
    { title: 'Financial Terms', icon: DollarSign, color: 'yellow' },
    { title: 'Contract Terms', icon: FileText, color: 'red' },
    { title: 'Legal Protections', icon: Shield, color: 'indigo' }
  ];

  const handleInputChange = (field: keyof ContractData, value: string | boolean | string[]) => {
    setContractData(prev => ({ ...prev, [field]: value }));
  };

  const handleContingencyChange = (contingency: string, checked: boolean) => {
    setContractData(prev => ({
      ...prev,
      contingencies: checked 
        ? [...prev.contingencies, contingency]
        : prev.contingencies.filter(c => c !== contingency)
    }));
  };

  const handleDisclosureChange = (disclosure: string, checked: boolean) => {
    setContractData(prev => ({
      ...prev,
      disclosures: checked 
        ? [...prev.disclosures, disclosure]
        : prev.disclosures.filter(d => d !== disclosure)
    }));
  };

  const calculateWholesaleFee = () => {
    if (contractData.feeType === 'percentage' && contractData.purchasePrice) {
      const price = parseFloat(contractData.purchasePrice.replace(/[,$]/g, ''));
      const percentage = parseFloat(contractData.feePercentage) / 100;
      const calculatedFee = price * percentage;
      return Math.max(calculatedFee, 10000); // Minimum $10,000
    }
    return parseFloat(contractData.wholesaleFee.replace(/[,$]/g, '')) || 10000;
  };

  const generateContract = async () => {
    setIsGenerating(true);
    
    // Simulate contract generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsGenerating(false);
    setShowPreview(true);
  };

  const downloadContract = () => {
    // Generate and download PDF contract
    const contractContent = generateContractHTML();
    const blob = new Blob([contractContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wholesale-contract-${contractData.propertyAddress.replace(/\s+/g, '-')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateContractHTML = () => {
    const finalWholesaleFee = calculateWholesaleFee();
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Wholesale Real Estate Purchase Agreement</title>
    <style>
        body { font-family: 'Times New Roman', serif; line-height: 1.6; margin: 40px; color: #000; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
        .section { margin: 20px 0; }
        .section-title { font-weight: bold; font-size: 14px; margin: 15px 0 10px 0; text-decoration: underline; }
        .clause { margin: 10px 0; text-align: justify; }
        .signature-section { margin-top: 40px; }
        .signature-line { border-bottom: 1px solid #000; width: 300px; display: inline-block; margin: 0 20px; }
        .date-line { border-bottom: 1px solid #000; width: 150px; display: inline-block; margin: 0 10px; }
        .checkbox { margin-right: 5px; }
        .important { font-weight: bold; background-color: #ffffcc; padding: 5px; }
        .legal-notice { border: 2px solid #000; padding: 15px; margin: 20px 0; background-color: #f9f9f9; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        td, th { border: 1px solid #000; padding: 8px; text-align: left; }
        th { background-color: #f0f0f0; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>WHOLESALE REAL ESTATE PURCHASE AGREEMENT</h1>
        <h2>WITH ASSIGNMENT RIGHTS</h2>
        <p><strong>Contract Date:</strong> ${new Date().toLocaleDateString()}</p>
    </div>

    <div class="legal-notice">
        <p class="important">IMPORTANT LEGAL NOTICE: This is a legally binding contract. All parties should seek independent legal counsel before signing. This contract includes wholesale assignment provisions and specific fee structures.</p>
    </div>

    <div class="section">
        <div class="section-title">1. PARTIES TO THE CONTRACT</div>
        
        <div class="clause">
            <strong>SELLER:</strong><br>
            Name: ${contractData.sellerName}<br>
            Address: ${contractData.sellerAddress}, ${contractData.sellerCity}, ${contractData.sellerState} ${contractData.sellerZip}<br>
            Phone: ${contractData.sellerPhone}<br>
            Email: ${contractData.sellerEmail}
        </div>

        <div class="clause">
            <strong>BUYER/WHOLESALER:</strong><br>
            Name: ${contractData.buyerName}<br>
            Address: ${contractData.buyerAddress}, ${contractData.buyerCity}, ${contractData.buyerState} ${contractData.buyerZip}<br>
            Phone: ${contractData.buyerPhone}<br>
            Email: ${contractData.buyerEmail}
        </div>
    </div>

    <div class="section">
        <div class="section-title">2. PROPERTY DESCRIPTION</div>
        
        <div class="clause">
            <strong>Property Address:</strong> ${contractData.propertyAddress}, ${contractData.propertyCity}, ${contractData.propertyState} ${contractData.propertyZip}
        </div>
        
        <div class="clause">
            <strong>Property Type:</strong> ${contractData.propertyType}
        </div>
        
        <div class="clause">
            <strong>Legal Description:</strong> ${contractData.legalDescription || 'To be provided by title company'}
        </div>
        
        <div class="clause">
            <strong>Parcel Number:</strong> ${contractData.parcelNumber || 'To be verified'}
        </div>
    </div>

    <div class="section">
        <div class="section-title">3. PURCHASE PRICE AND FINANCIAL TERMS</div>
        
        <table>
            <tr>
                <th>Financial Component</th>
                <th>Amount</th>
                <th>Due Date</th>
            </tr>
            <tr>
                <td>Purchase Price</td>
                <td>$${parseFloat(contractData.purchasePrice.replace(/[,$]/g, '')).toLocaleString()}</td>
                <td>At Closing</td>
            </tr>
            <tr>
                <td>Earnest Money Deposit</td>
                <td>$${parseFloat(contractData.earnestMoney.replace(/[,$]/g, '')).toLocaleString()}</td>
                <td>Within 3 business days</td>
            </tr>
            <tr>
                <td>Wholesale Assignment Fee</td>
                <td>$${finalWholesaleFee.toLocaleString()}</td>
                <td>At Assignment or Closing</td>
            </tr>
        </table>

        <div class="clause important">
            <strong>WHOLESALE FEE PROVISION:</strong> The wholesale fee of $${finalWholesaleFee.toLocaleString()} represents the minimum compensation for the Buyer's services in locating, contracting, and facilitating the sale of this property. This fee is earned upon execution of this contract and is non-refundable except in cases of Seller default.
        </div>
    </div>

    <div class="section">
        <div class="section-title">4. ASSIGNMENT RIGHTS AND WHOLESALE PROVISIONS</div>
        
        <div class="clause">
            <strong>4.1 ASSIGNMENT RIGHTS:</strong> Buyer expressly reserves the right to assign this contract, in whole or in part, to any individual, corporation, LLC, partnership, or other entity without the consent of Seller. This assignment right is a material term of this agreement.
        </div>
        
        <div class="clause">
            <strong>4.2 WHOLESALE DISCLOSURE:</strong> Seller acknowledges and agrees that Buyer is acting as a wholesale investor and may assign this contract to an end buyer for a profit. Seller has been informed of Buyer's wholesale intentions and agrees to cooperate with any assignment.
        </div>
        
        <div class="clause">
            <strong>4.3 ASSIGNMENT PROCEDURE:</strong> Upon assignment, the assignee shall assume all rights and obligations of the original Buyer under this contract. Original Buyer shall remain liable for performance unless expressly released by Seller in writing.
        </div>
        
        <div class="clause">
            <strong>4.4 ASSIGNMENT FEE:</strong> Any assignment fee paid to Buyer by assignee is separate from and in addition to the purchase price and shall not reduce the amount due to Seller.
        </div>
    </div>

    <div class="section">
        <div class="section-title">5. CONTINGENCIES AND CONDITIONS</div>
        
        <div class="clause">
            <strong>5.1 INSPECTION PERIOD:</strong> Buyer shall have ${contractData.inspectionPeriod} days from the execution of this contract to inspect the property and approve its condition. This inspection period is for Buyer's sole benefit and may be waived by Buyer.
        </div>
        
        <div class="clause">
            <strong>5.2 FINANCING CONTINGENCY:</strong> This contract is contingent upon Buyer or Buyer's assignee obtaining suitable financing within 30 days of contract execution, if financing is required.
        </div>
        
        <div class="clause">
            <strong>5.3 TITLE CONTINGENCY:</strong> This sale is contingent upon Seller providing marketable title, free and clear of all liens and encumbrances except those specifically accepted by Buyer.
        </div>
        
        ${contractData.contingencies.length > 0 ? `
        <div class="clause">
            <strong>5.4 ADDITIONAL CONTINGENCIES:</strong>
            <ul>
                ${contractData.contingencies.map(c => `<li>${c}</li>`).join('')}
            </ul>
        </div>
        ` : ''}
    </div>

    <div class="section">
        <div class="section-title">6. CLOSING PROVISIONS</div>
        
        <div class="clause">
            <strong>6.1 CLOSING DATE:</strong> Closing shall occur on or before ${contractData.closingDate || '[DATE TO BE DETERMINED]'}, or such other date as mutually agreed upon by the parties.
        </div>
        
        <div class="clause">
            <strong>6.2 CLOSING LOCATION:</strong> Closing shall take place at a title company or attorney's office mutually agreed upon by the parties, or such other location as the parties may agree.
        </div>
        
        <div class="clause">
            <strong>6.3 CLOSING COSTS:</strong> Each party shall pay their own closing costs unless otherwise specified. Seller shall pay for title insurance policy, transfer taxes, and recording fees for deed. Buyer shall pay for loan-related costs, if any.
        </div>
        
        <div class="clause">
            <strong>6.4 PRORATIONS:</strong> Property taxes, HOA fees, utilities, and other property-related expenses shall be prorated as of the closing date.
        </div>
    </div>

    <div class="section">
        <div class="section-title">7. SELLER REPRESENTATIONS AND WARRANTIES</div>
        
        <div class="clause">
            <strong>7.1 OWNERSHIP:</strong> Seller represents that they are the legal owner of the property and have the right to sell the property.
        </div>
        
        <div class="clause">
            <strong>7.2 LIENS AND ENCUMBRANCES:</strong> Seller warrants that there are no liens, judgments, or other encumbrances against the property except as disclosed in writing.
        </div>
        
        <div class="clause">
            <strong>7.3 CONDITION:</strong> Seller makes no warranties as to the condition of the property. Property is sold "AS IS" with all faults.
        </div>
        
        <div class="clause">
            <strong>7.4 LEGAL COMPLIANCE:</strong> Seller warrants that the property complies with all applicable zoning laws and building codes, or discloses any known violations.
        </div>
    </div>

    <div class="section">
        <div class="section-title">8. BUYER ACKNOWLEDGMENTS</div>
        
        <div class="clause">
            <strong>8.1 PROPERTY CONDITION:</strong> Buyer acknowledges purchasing the property "AS IS" and has been advised to conduct independent inspections.
        </div>
        
        <div class="clause">
            <strong>8.2 WHOLESALE NATURE:</strong> Buyer acknowledges this is a wholesale transaction and that Buyer intends to assign this contract or resell the property for a profit.
        </div>
        
        <div class="clause">
            <strong>8.3 INDEPENDENT ADVICE:</strong> Buyer acknowledges being advised to seek independent legal and financial counsel regarding this transaction.
        </div>
    </div>

    <div class="section">
        <div class="section-title">9. DEFAULT AND REMEDIES</div>
        
        <div class="clause">
            <strong>9.1 SELLER DEFAULT:</strong> If Seller defaults, Buyer may: (a) terminate this contract and receive return of earnest money, (b) seek specific performance, or (c) pursue other legal remedies.
        </div>
        
        <div class="clause">
            <strong>9.2 BUYER DEFAULT:</strong> If Buyer defaults, Seller may retain earnest money as liquidated damages, unless Seller elects to pursue other legal remedies.
        </div>
        
        <div class="clause">
            <strong>9.3 WHOLESALE FEE PROTECTION:</strong> In the event of Seller default after contract execution, Buyer shall be entitled to the wholesale fee as compensation for time and effort invested.
        </div>
    </div>

    <div class="section">
        <div class="section-title">10. DISCLOSURES AND REGULATORY COMPLIANCE</div>
        
        <div class="clause">
            <strong>10.1 LEAD-BASED PAINT:</strong> For properties built before 1978, Seller shall provide required lead-based paint disclosures and allow inspection period.
        </div>
        
        <div class="clause">
            <strong>10.2 PROPERTY CONDITION DISCLOSURE:</strong> Seller shall provide any required property condition disclosure statements as mandated by state law.
        </div>
        
        <div class="clause">
            <strong>10.3 WHOLESALE BUSINESS DISCLOSURE:</strong> Buyer discloses that they are engaged in the business of wholesaling real estate and may profit from this transaction through assignment or resale.
        </div>
        
        ${contractData.disclosures.length > 0 ? `
        <div class="clause">
            <strong>10.4 ADDITIONAL DISCLOSURES:</strong>
            <ul>
                ${contractData.disclosures.map(d => `<li>${d}</li>`).join('')}
            </ul>
        </div>
        ` : ''}
    </div>

    <div class="section">
        <div class="section-title">11. GENERAL PROVISIONS</div>
        
        <div class="clause">
            <strong>11.1 TIME IS OF THE ESSENCE:</strong> Time is of the essence in this contract. All deadlines are strictly enforced.
        </div>
        
        <div class="clause">
            <strong>11.2 GOVERNING LAW:</strong> This contract shall be governed by the laws of the state where the property is located.
        </div>
        
        <div class="clause">
            <strong>11.3 ENTIRE AGREEMENT:</strong> This contract constitutes the entire agreement between the parties and supersedes all prior negotiations and agreements.
        </div>
        
        <div class="clause">
            <strong>11.4 AMENDMENTS:</strong> This contract may only be amended in writing signed by all parties.
        </div>
        
        <div class="clause">
            <strong>11.5 SEVERABILITY:</strong> If any provision of this contract is deemed invalid, the remaining provisions shall remain in full force and effect.
        </div>
        
        <div class="clause">
            <strong>11.6 DISPUTE RESOLUTION:</strong> Any disputes arising from this contract shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.
        </div>
    </div>

    ${contractData.additionalTerms ? `
    <div class="section">
        <div class="section-title">12. ADDITIONAL TERMS AND CONDITIONS</div>
        <div class="clause">
            ${contractData.additionalTerms}
        </div>
    </div>
    ` : ''}

    <div class="legal-notice">
        <p><strong>IMPORTANT NOTICE:</strong> This contract contains wholesale provisions and assignment rights. Both parties acknowledge understanding the wholesale nature of this transaction. Consult with qualified legal counsel before signing.</p>
    </div>

    <div class="signature-section">
        <div class="section-title">SIGNATURES</div>
        
        <p><strong>SELLER ACKNOWLEDGMENT:</strong></p>
        <p>By signing below, Seller acknowledges reading and understanding this contract, including the wholesale provisions and assignment rights granted to Buyer.</p>
        
        <br><br>
        <div class="signature-line"></div> &nbsp;&nbsp;&nbsp; Date: <div class="date-line"></div><br>
        <strong>Seller Signature: ${contractData.sellerName}</strong>
        
        <br><br><br>
        <p><strong>BUYER/WHOLESALER ACKNOWLEDGMENT:</strong></p>
        <p>By signing below, Buyer acknowledges their wholesale intentions and agrees to all terms and conditions of this contract.</p>
        
        <br><br>
        <div class="signature-line"></div> &nbsp;&nbsp;&nbsp; Date: <div class="date-line"></div><br>
        <strong>Buyer Signature: ${contractData.buyerName}</strong>
        
        <br><br><br>
        <p><strong>NOTARIZATION:</strong></p>
        <p>State of: _________________ County of: _________________</p>
        <p>On this _____ day of _________, 20__, before me personally appeared the above-named parties, who proved to me on the basis of satisfactory evidence to be the persons whose names are subscribed to the within instrument.</p>
        
        <br><br>
        <div class="signature-line"></div><br>
        <strong>Notary Public Signature</strong><br>
        My commission expires: ________________
    </div>

    <div style="page-break-before: always;">
        <div class="header">
            <h2>ADDENDUM A: WHOLESALE TRANSACTION DISCLOSURE</h2>
        </div>
        
        <div class="legal-notice">
            <p><strong>WHOLESALE TRANSACTION NOTICE:</strong> This addendum provides additional disclosure regarding the wholesale nature of this real estate transaction.</p>
        </div>
        
        <div class="clause">
            <strong>WHOLESALE DEFINITION:</strong> A wholesale real estate transaction is one where the Buyer contracts to purchase property with the intention of assigning the contract or reselling the property to another party for a profit, typically without taking title to the property.
        </div>
        
        <div class="clause">
            <strong>SELLER ACKNOWLEDGMENT:</strong> Seller acknowledges and understands that:
            <ul>
                <li>Buyer is a wholesale real estate investor</li>
                <li>Buyer intends to assign this contract or resell the property</li>
                <li>Buyer may profit from this transaction through assignment fees or resale</li>
                <li>The wholesale fee is earned upon contract execution</li>
                <li>Seller has been advised to seek independent legal counsel</li>
            </ul>
        </div>
        
        <div class="clause">
            <strong>ASSIGNMENT PROCESS:</strong> If Buyer assigns this contract:
            <ul>
                <li>Seller will be notified of the assignment</li>
                <li>Assignee will assume Buyer's obligations</li>
                <li>Closing may proceed with assignee as purchaser</li>
                <li>Purchase price to Seller remains unchanged</li>
            </ul>
        </div>
        
        <div class="clause">
            <strong>REGULATORY COMPLIANCE:</strong> This transaction complies with all applicable real estate laws and regulations. Buyer is not acting as a licensed real estate agent unless separately disclosed.
        </div>
        
        <br><br>
        <div class="signature-line"></div> &nbsp;&nbsp;&nbsp; Date: <div class="date-line"></div><br>
        <strong>Seller Signature (Addendum A)</strong>
        
        <br><br>
        <div class="signature-line"></div> &nbsp;&nbsp;&nbsp; Date: <div class="date-line"></div><br>
        <strong>Buyer Signature (Addendum A)</strong>
    </div>
</body>
</html>
    `;
  };

  const nextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const getSectionColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500',
      indigo: 'bg-indigo-500',
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Wholesale Real Estate Contract Generator
          </h1>
          <p className="text-gray-600">
            Professional wholesale purchase agreement with assignment rights and legal protections
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {sections.map((section, index) => {
              const Icon = section.icon;
              const isActive = index === currentSection;
              const isCompleted = index < currentSection;
              
              return (
                <div key={index} className="flex items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? `${getSectionColor(section.color)} text-white shadow-lg scale-110`
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  {index < sections.length - 1 && (
                    <div
                      className={`h-1 w-12 mx-2 transition-all duration-300 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {sections[currentSection].title}
            </h2>
            <p className="text-sm text-gray-600">
              Step {currentSection + 1} of {sections.length}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Section 0: Seller Information */}
          {currentSection === 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seller Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={contractData.sellerName}
                      onChange={(e) => handleInputChange('sellerName', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter seller's full legal name"
                      required
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seller Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={contractData.sellerAddress}
                      onChange={(e) => handleInputChange('sellerAddress', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Street address"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={contractData.sellerCity}
                    onChange={(e) => handleInputChange('sellerCity', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="City"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={contractData.sellerState}
                    onChange={(e) => handleInputChange('sellerState', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="State"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    value={contractData.sellerZip}
                    onChange={(e) => handleInputChange('sellerZip', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="ZIP Code"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      value={contractData.sellerPhone}
                      onChange={(e) => handleInputChange('sellerPhone', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="(555) 123-4567"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={contractData.sellerEmail}
                      onChange={(e) => handleInputChange('sellerEmail', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="seller@email.com"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 1: Buyer Information */}
          {currentSection === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buyer/Wholesaler Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={contractData.buyerName}
                      onChange={(e) => handleInputChange('buyerName', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="Enter buyer's full legal name or company name"
                      required
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buyer Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={contractData.buyerAddress}
                      onChange={(e) => handleInputChange('buyerAddress', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="Street address"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={contractData.buyerCity}
                    onChange={(e) => handleInputChange('buyerCity', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="City"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={contractData.buyerState}
                    onChange={(e) => handleInputChange('buyerState', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="State"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    value={contractData.buyerZip}
                    onChange={(e) => handleInputChange('buyerZip', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="ZIP Code"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      value={contractData.buyerPhone}
                      onChange={(e) => handleInputChange('buyerPhone', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="(555) 123-4567"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={contractData.buyerEmail}
                      onChange={(e) => handleInputChange('buyerEmail', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="buyer@email.com"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Property Details */}
          {currentSection === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Address *
                  </label>
                  <div className="relative">
                    <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={contractData.propertyAddress}
                      onChange={(e) => handleInputChange('propertyAddress', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                      placeholder="Property street address"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={contractData.propertyCity}
                    onChange={(e) => handleInputChange('propertyCity', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    placeholder="City"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={contractData.propertyState}
                    onChange={(e) => handleInputChange('propertyState', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    placeholder="State"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    value={contractData.propertyZip}
                    onChange={(e) => handleInputChange('propertyZip', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    placeholder="ZIP Code"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type *
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      value={contractData.propertyType}
                      onChange={(e) => handleInputChange('propertyType', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                      required
                    >
                      <option value="single-family">Single Family Home</option>
                      <option value="multi-family">Multi-Family (2-4 units)</option>
                      <option value="condo">Condominium</option>
                      <option value="townhouse">Townhouse</option>
                      <option value="apartment">Apartment Building (5+ units)</option>
                      <option value="commercial">Commercial Property</option>
                      <option value="land">Vacant Land</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Legal Description
                  </label>
                  <textarea
                    value={contractData.legalDescription}
                    onChange={(e) => handleInputChange('legalDescription', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
                    placeholder="Legal description of the property (will be provided by title company if left blank)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parcel Number (APN)
                  </label>
                  <input
                    type="text"
                    value={contractData.parcelNumber}
                    onChange={(e) => handleInputChange('parcelNumber', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    placeholder="Assessor's Parcel Number"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Financial Terms */}
          {currentSection === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purchase Price *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={contractData.purchasePrice}
                      onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
                      placeholder="250,000"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Earnest Money Deposit *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={contractData.earnestMoney}
                      onChange={(e) => handleInputChange('earnestMoney', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
                      placeholder="1,000"
                      required
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Wholesale Fee Structure *
                  </label>
                  <div className="space-y-4">
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="feeType"
                          value="fixed"
                          checked={contractData.feeType === 'fixed'}
                          onChange={(e) => handleInputChange('feeType', e.target.value)}
                          className="w-4 h-4 text-yellow-600 border-gray-300 focus:ring-yellow-500"
                        />
                        <span className="ml-2 text-gray-700">Fixed Amount</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="feeType"
                          value="percentage"
                          checked={contractData.feeType === 'percentage'}
                          onChange={(e) => handleInputChange('feeType', e.target.value)}
                          className="w-4 h-4 text-yellow-600 border-gray-300 focus:ring-yellow-500"
                        />
                        <span className="ml-2 text-gray-700">Percentage of Purchase Price</span>
                      </label>
                    </div>

                    {contractData.feeType === 'fixed' ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fixed Wholesale Fee (Minimum $10,000) *
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            value={contractData.wholesaleFee}
                            onChange={(e) => handleInputChange('wholesaleFee', e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
                            placeholder="10,000"
                            required
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Percentage (Minimum equivalent to $10,000) *
                        </label>
                        <div className="relative">
                          <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            value={contractData.feePercentage}
                            onChange={(e) => handleInputChange('feePercentage', e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
                            placeholder="5"
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-yellow-900">Calculated Wholesale Fee</h4>
                          <p className="text-yellow-800 text-sm mt-1">
                            Based on your settings: <strong>${calculateWholesaleFee().toLocaleString()}</strong>
                          </p>
                          <p className="text-yellow-700 text-xs mt-1">
                            This fee is earned upon contract execution and represents compensation for locating and contracting the property.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assignment Fee (if different)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={contractData.assignmentFee}
                      onChange={(e) => handleInputChange('assignmentFee', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
                      placeholder="Optional separate assignment fee"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Contract Terms */}
          {currentSection === 4 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Inspection Period (Days) *
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      value={contractData.inspectionPeriod}
                      onChange={(e) => handleInputChange('inspectionPeriod', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                      placeholder="10"
                      min="1"
                      max="30"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Closing Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      value={contractData.closingDate}
                      onChange={(e) => handleInputChange('closingDate', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Contract Contingencies
                  </label>
                  <div className="space-y-3">
                    {[
                      'Financing contingency (30 days)',
                      'Appraisal contingency',
                      'Home inspection contingency',
                      'Title contingency',
                      'Survey contingency',
                      'HOA document review',
                      'Environmental inspection',
                      'Termite/pest inspection'
                    ].map((contingency) => (
                      <label key={contingency} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={contractData.contingencies.includes(contingency)}
                          onChange={(e) => handleContingencyChange(contingency, e.target.checked)}
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <span className="ml-3 text-sm font-medium text-gray-700">{contingency}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Terms and Conditions
                  </label>
                  <textarea
                    value={contractData.additionalTerms}
                    onChange={(e) => handleInputChange('additionalTerms', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors resize-none"
                    placeholder="Enter any additional terms, special conditions, or seller concessions..."
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertTriangle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-900">Assignment Rights Notice</h4>
                        <p className="text-red-800 text-sm mt-1">
                          This contract includes full assignment rights. The buyer may assign this contract to any third party without seller consent. This is a material term of the wholesale agreement.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Legal Protections */}
          {currentSection === 5 && (
            <div className="space-y-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Required Disclosures
                  </label>
                  <div className="space-y-3">
                    {[
                      'Lead-based paint disclosure (pre-1978 properties)',
                      'Property condition disclosure',
                      'Wholesale business disclosure',
                      'Assignment rights disclosure',
                      'Natural hazard disclosure',
                      'HOA disclosure (if applicable)',
                      'Flood zone disclosure',
                      'Environmental hazards disclosure'
                    ].map((disclosure) => (
                      <label key={disclosure} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={contractData.disclosures.includes(disclosure)}
                          onChange={(e) => handleDisclosureChange(disclosure, e.target.checked)}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="ml-3 text-sm font-medium text-gray-700">{disclosure}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <Shield className="w-5 h-5 text-indigo-600 mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-indigo-900">Legal Protections Included</h4>
                        <ul className="text-indigo-800 text-sm mt-2 space-y-1">
                          <li>• Wholesale fee protection clause</li>
                          <li>• Assignment rights preservation</li>
                          <li>• Default remedies and liquidated damages</li>
                          <li>• Time is of the essence provisions</li>
                          <li>• Dispute resolution through arbitration</li>
                          <li>• Governing law and jurisdiction clauses</li>
                          <li>• Severability and entire agreement provisions</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <Scale className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-900">Legal Compliance Notice</h4>
                        <p className="text-yellow-800 text-sm mt-1">
                          This contract complies with wholesale real estate regulations and includes all necessary disclosures. Both parties are advised to seek independent legal counsel before signing. The contract includes provisions for regulatory compliance in all states.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="flex items-center p-4 border-2 border-indigo-300 rounded-lg bg-indigo-50">
                    <input
                      type="checkbox"
                      checked={contractData.assigneeRights}
                      onChange={(e) => handleInputChange('assigneeRights', e.target.checked)}
                      className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-medium text-indigo-900">
                        Grant Full Assignment Rights
                      </span>
                      <p className="text-xs text-indigo-700 mt-1">
                        Buyer may assign this contract to any party without seller consent (Required for wholesale transactions)
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={prevSection}
              disabled={currentSection === 0}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentSection < sections.length - 1 ? (
              <button
                type="button"
                onClick={nextSection}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next Section
              </button>
            ) : (
              <button
                type="button"
                onClick={generateContract}
                disabled={isGenerating}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Contract
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Contract Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Contract Preview</h3>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={downloadContract}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </button>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">WHOLESALE REAL ESTATE PURCHASE AGREEMENT</h2>
                    <p className="text-gray-600 mt-2">Contract Date: {new Date().toLocaleDateString()}</p>
                  </div>
                  
                  <div className="space-y-4 text-sm">
                    <div className="bg-white p-4 rounded border">
                      <h3 className="font-semibold text-gray-900 mb-2">PARTIES</h3>
                      <p><strong>Seller:</strong> {contractData.sellerName}</p>
                      <p><strong>Buyer/Wholesaler:</strong> {contractData.buyerName}</p>
                    </div>
                    
                    <div className="bg-white p-4 rounded border">
                      <h3 className="font-semibold text-gray-900 mb-2">PROPERTY</h3>
                      <p>{contractData.propertyAddress}, {contractData.propertyCity}, {contractData.propertyState} {contractData.propertyZip}</p>
                      <p><strong>Type:</strong> {contractData.propertyType}</p>
                    </div>
                    
                    <div className="bg-white p-4 rounded border">
                      <h3 className="font-semibold text-gray-900 mb-2">FINANCIAL TERMS</h3>
                      <p><strong>Purchase Price:</strong> ${parseFloat(contractData.purchasePrice.replace(/[,$]/g, '')).toLocaleString()}</p>
                      <p><strong>Earnest Money:</strong> ${parseFloat(contractData.earnestMoney.replace(/[,$]/g, '')).toLocaleString()}</p>
                      <p><strong>Wholesale Fee:</strong> ${calculateWholesaleFee().toLocaleString()}</p>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
                      <h3 className="font-semibold text-yellow-900 mb-2">ASSIGNMENT RIGHTS</h3>
                      <p className="text-yellow-800 text-xs">
                        This contract includes full assignment rights. Buyer may assign to any party without seller consent.
                        Wholesale fee of ${calculateWholesaleFee().toLocaleString()} is earned upon contract execution.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};