import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import stripePromise from './lib/stripe';
import { Header } from './components/Layout/Header';
import { PricingPage } from './pages/PricingPage';
import { AuthPage } from './pages/AuthPage';
import { ForeclosurePage } from './pages/ForeclosurePage';
import { useAuthStore } from './store/authStore';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to RepMotivatedSeller
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your comprehensive real estate analysis platform
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Property Analysis
              </h3>
              <p className="text-gray-600">
                Analyze flip and rental properties with advanced calculations
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Market Research
              </h3>
              <p className="text-gray-600">
                Access comprehensive market data and comparables
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Professional Reports
              </h3>
              <p className="text-gray-600">
                Generate branded presentations and detailed reports
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Elements stripe={stripePromise}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          
          <Routes>
            <Route 
              path="/" 
              element={isAuthenticated ? <Dashboard /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/auth" 
              element={!isAuthenticated ? <AuthPage /> : <Navigate to="/" />} 
            />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/foreclosure" element={<ForeclosurePage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </Elements>
  );
}

export default App;