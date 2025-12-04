'use client';

import { useState } from 'react';
import { useDarkMode } from '../components/common/DarkModeProvider';
import Loader from '../components/common/Loader';
import WealthProjectionChart from '../components/charts/WealthProjectionChart';

interface Goal {
  id: string;
  name: string;
  targetYear: string;
  targetAmount: string;
  currentValue: string;
  yearsAway: string;
  category: string;
  icon: string;
}

export default function WealthPathPage() {
  const [activeTab, setActiveTab] = useState('input');
  const { isDarkMode } = useDarkMode();
  const [isDataEntered, setIsDataEntered] = useState(false);
  const [showAccessMessage, setShowAccessMessage] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Financial Profile State - Initially empty
  const [financialProfile, setFinancialProfile] = useState({
    name: '',
    mobileNo: '',
    currentAge: '',
    monthlySIP: '',
    expectedReturn: '',
    currentAUM: '',
    annualSIPIncrease: '',
    inflationRate: '',
  });

  // Life Goals State - Initially empty
  const [goals, setGoals] = useState<Goal[]>([]);

  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [goalFormData, setGoalFormData] = useState({
    name: '',
    category: 'Retirement',
    targetYear: '',
    targetAmount: '',
    currentValue: '0',
  });

  const handleProfileChange = (field: string, value: string) => {
    setFinancialProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = () => {
    // Validate required fields
    if (!financialProfile.name || !financialProfile.mobileNo) {
      alert('Please fill in all required fields (Name and Mobile No.)');
      return;
    }

    // Validate that at least some financial data is entered
    if (!financialProfile.currentAge && !financialProfile.monthlySIP && !financialProfile.currentAUM) {
      alert('Please enter at least some financial information (Age, Monthly SIP, or Current AUM)');
      return;
    }

    // Show loader while processing
    setIsProcessing(true);

    // Process data (calculations happen synchronously, but show loader briefly for UX)
    // Use requestAnimationFrame to ensure UI updates before heavy calculations
    requestAnimationFrame(() => {
      // Mark data as entered
      setIsDataEntered(true);
      setShowAccessMessage(false);
      
      // Hide loader after a brief moment to show processing
      setTimeout(() => {
        setIsProcessing(false);
        // Switch to dashboard tab after saving
        setActiveTab('dashboard');
      }, 300);
    });
  };

  const handleReset = () => {
    // Reset financial profile to empty
    setFinancialProfile({
      name: '',
      mobileNo: '',
      currentAge: '',
      monthlySIP: '',
      expectedReturn: '',
      currentAUM: '',
      annualSIPIncrease: '',
      inflationRate: '',
    });

    // Reset goals
    setGoals([]);

    // Reset form data
    setGoalFormData({
      name: '',
      category: 'Retirement',
      targetYear: '',
      targetAmount: '',
      currentValue: '0',
    });

    // Reset data entered flag
    setIsDataEntered(false);
    setShowAccessMessage(false);

    // Ensure we're on input tab
    setActiveTab('input');
  };

  const handleTabChange = (tab: string) => {
    // If trying to access dashboard or analysis without data, show message
    if ((tab === 'dashboard' || tab === 'analysis') && !isDataEntered) {
      setShowAccessMessage(true);
      // Don't change tab, stay on input
      return;
    }
    
    // Allow tab change if data is entered or if going to input tab
    setShowAccessMessage(false);
    setActiveTab(tab);
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(goals.filter((goal) => goal.id !== id));
  };

  const handleEditGoal = (goal: Goal) => {
    // Extract numeric values from formatted strings
    let targetAmount = 0;
    let currentValue = 0;

    // Parse target amount
    if (goal.targetAmount.includes('Cr')) {
      const num = parseFloat(goal.targetAmount.replace(/[₹,Cr]/g, ''));
      targetAmount = num * 10000000;
    } else if (goal.targetAmount.includes('L')) {
      const num = parseFloat(goal.targetAmount.replace(/[₹,L]/g, ''));
      targetAmount = num * 100000;
    } else {
      targetAmount = parseFloat(goal.targetAmount.replace(/[₹,]/g, '')) || 0;
    }

    // Parse current value
    if (goal.currentValue.includes('Cr')) {
      const num = parseFloat(goal.currentValue.replace(/[₹,Cr]/g, ''));
      currentValue = num * 10000000;
    } else if (goal.currentValue.includes('L')) {
      const num = parseFloat(goal.currentValue.replace(/[₹,L]/g, ''));
      currentValue = num * 100000;
    } else {
      currentValue = parseFloat(goal.currentValue.replace(/[₹,]/g, '')) || 0;
    }

    setGoalFormData({
      name: goal.name,
      category: goal.category,
      targetYear: goal.targetYear,
      targetAmount: targetAmount.toString(),
      currentValue: currentValue.toString(),
    });
    setEditingGoal(goal);
  };

  const handleGoalFormChange = (field: string, value: string) => {
    setGoalFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatAmount = (amount: number): string => {
    // Handle NaN, undefined, or null
    if (!amount || isNaN(amount)) {
      return '₹0';
    }
    
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(2)}K`;
    } else {
      return `₹${Math.round(amount).toLocaleString('en-IN')}`;
    }
  };

  const calculateYearsAway = (targetYear: string): string => {
    const currentYear = new Date().getFullYear();
    const years = parseInt(targetYear) - currentYear;
    return `${years} years`;
  };

  // Parse amount string to number
  const parseAmount = (amountStr: string): number => {
    if (amountStr.includes('Cr')) {
      return parseFloat(amountStr.replace(/[₹,Cr]/g, '')) * 10000000;
    } else if (amountStr.includes('L')) {
      return parseFloat(amountStr.replace(/[₹,L]/g, '')) * 100000;
    }
    return parseFloat(amountStr.replace(/[₹,]/g, '')) || 0;
  };

  // Calculate adjusted target with inflation
  const calculateAdjustedTarget = (targetAmount: number, targetYear: string, inflationRate: number): number => {
    const currentYear = new Date().getFullYear();
    const years = parseInt(targetYear) - currentYear;
    if (years <= 0) return targetAmount;
    return targetAmount * Math.pow(1 + inflationRate / 100, years);
  };

  // Calculate projected value based on financial profile
  const calculateProjectedValue = (
    currentAUM: number,
    monthlySIP: number,
    expectedReturn: number,
    annualSIPIncrease: number,
    targetYear: string,
    currentAge: number
  ): number => {
    const currentYear = new Date().getFullYear();
    const years = parseInt(targetYear) - currentYear;
    if (years <= 0) return currentAUM;

    let projectedValue = currentAUM;
    const monthlyReturn = expectedReturn / 100 / 12;
    const annualReturn = expectedReturn / 100;

    // Calculate year by year
    for (let year = 0; year < years; year++) {
      // Apply annual return to existing value
      projectedValue = projectedValue * (1 + annualReturn);
      
      // Add monthly SIPs for the year (with annual increase)
      const currentYearSIP = monthlySIP * Math.pow(1 + annualSIPIncrease / 100, year);
      
      // Calculate SIP contributions with monthly compounding
      // Each SIP grows from the month it's invested until the end of the year
      let sipContribution = 0;
      for (let month = 0; month < 12; month++) {
        // SIP invested at the start of each month, grows for (12 - month) months
        const monthsRemaining = 12 - month;
        sipContribution += currentYearSIP * Math.pow(1 + monthlyReturn, monthsRemaining);
      }
      
      projectedValue = projectedValue + sipContribution;
    }

    return projectedValue;
  };

  // Calculate goal feasibility metrics
  const calculateGoalMetrics = (goal: Goal) => {
    const targetAmount = parseAmount(goal.targetAmount);
    const currentValue = parseAmount(goal.currentValue);
    const inflationRate = parseFloat(financialProfile.inflationRate) || 6;
    const currentAUM = parseFloat(financialProfile.currentAUM) || 0;
    const monthlySIP = parseFloat(financialProfile.monthlySIP) || 0;
    const expectedReturn = parseFloat(financialProfile.expectedReturn) || 12;
    const annualSIPIncrease = parseFloat(financialProfile.annualSIPIncrease) || 10;
    const currentAge = parseFloat(financialProfile.currentAge) || 30;

    const adjustedTarget = calculateAdjustedTarget(targetAmount, goal.targetYear, inflationRate);
    const projectedValue = calculateProjectedValue(
      currentAUM,
      monthlySIP,
      expectedReturn,
      annualSIPIncrease,
      goal.targetYear,
      currentAge
    ) + currentValue; // Add current value to projected

    const shortfall = adjustedTarget - projectedValue;
    const fundingRatio = adjustedTarget > 0 ? Math.min(100, (projectedValue / adjustedTarget) * 100) : 0;
    const isOnTrack = shortfall <= 0;

    return {
      adjustedTarget,
      projectedValue,
      shortfall,
      fundingRatio,
      isOnTrack,
    };
  };

  // Calculate total projected wealth at the furthest goal year
  const calculateTotalProjectedWealth = (): number => {
    if (goals.length === 0) {
      const currentAUM = parseFloat(financialProfile.currentAUM) || 0;
      const monthlySIP = parseFloat(financialProfile.monthlySIP) || 0;
      const expectedReturn = parseFloat(financialProfile.expectedReturn) || 12;
      const annualSIPIncrease = parseFloat(financialProfile.annualSIPIncrease) || 10;
      const currentAge = parseFloat(financialProfile.currentAge) || 30;
      const currentYear = new Date().getFullYear();
      const targetYear = (currentYear + 30).toString(); // Default 30 years if no goals
      return calculateProjectedValue(currentAUM, monthlySIP, expectedReturn, annualSIPIncrease, targetYear, currentAge);
    }

    // Find the furthest goal year
    const furthestGoal = goals.reduce((furthest, goal) => {
      return parseInt(goal.targetYear) > parseInt(furthest.targetYear) ? goal : furthest;
    }, goals[0]);

    const currentAUM = parseFloat(financialProfile.currentAUM) || 0;
    const monthlySIP = parseFloat(financialProfile.monthlySIP) || 0;
    const expectedReturn = parseFloat(financialProfile.expectedReturn) || 12;
    const annualSIPIncrease = parseFloat(financialProfile.annualSIPIncrease) || 10;
    const currentAge = parseFloat(financialProfile.currentAge) || 30;

    return calculateProjectedValue(
      currentAUM,
      monthlySIP,
      expectedReturn,
      annualSIPIncrease,
      furthestGoal.targetYear,
      currentAge
    );
  };

  // Calculate total goals amount
  const calculateTotalGoalsAmount = (): number => {
    return goals.reduce((total, goal) => {
      return total + parseAmount(goal.targetAmount);
    }, 0);
  };

  // Calculate year-by-year projections
  const calculateYearByYearProjections = () => {
    const currentYear = new Date().getFullYear();
    const currentAge = parseFloat(financialProfile.currentAge) || 30;
    const currentAUM = parseFloat(financialProfile.currentAUM) || 0;
    const monthlySIP = parseFloat(financialProfile.monthlySIP) || 0;
    const expectedReturn = parseFloat(financialProfile.expectedReturn) || 12;
    const annualSIPIncrease = parseFloat(financialProfile.annualSIPIncrease) || 10;
    const inflationRate = parseFloat(financialProfile.inflationRate) || 6;

    // Find the furthest goal year to determine projection range
    const maxYear = goals.length > 0
      ? Math.max(...goals.map((goal) => parseInt(goal.targetYear)))
      : currentYear + 30;

    const projections: Array<{
      year: number;
      age: number;
      investment: number;
      monthlySIP: number;
      annualSIP: number;
      goalsRequired: number;
      surplusDeficit: number;
    }> = [];

    let runningValue = currentAUM;
    const monthlyReturn = expectedReturn / 100 / 12;
    const annualReturn = expectedReturn / 100;

    for (let yearOffset = 0; yearOffset <= maxYear - currentYear && yearOffset <= 30; yearOffset++) {
      const year = currentYear + yearOffset;
      const age = Math.floor(currentAge + yearOffset);

      // Calculate current year's monthly SIP (with annual increase)
      const currentYearMonthlySIP = monthlySIP * Math.pow(1 + annualSIPIncrease / 100, yearOffset);
      const currentYearAnnualSIP = currentYearMonthlySIP * 12;

      // Apply annual return to existing value
      runningValue = runningValue * (1 + annualReturn);

      // Add monthly SIPs for the year with monthly compounding
      let sipContribution = 0;
      for (let month = 0; month < 12; month++) {
        const monthsRemaining = 12 - month;
        sipContribution += currentYearMonthlySIP * Math.pow(1 + monthlyReturn, monthsRemaining);
      }

      runningValue = runningValue + sipContribution;

      // Calculate goals required for this year (adjusted for inflation)
      let goalsRequired = 0;
      goals.forEach((goal) => {
        if (parseInt(goal.targetYear) === year) {
          const targetAmount = parseAmount(goal.targetAmount);
          const yearsFromNow = year - currentYear;
          const adjustedTarget = targetAmount * Math.pow(1 + inflationRate / 100, yearsFromNow);
          goalsRequired += adjustedTarget;
        }
      });

      const surplusDeficit = runningValue - goalsRequired;

      projections.push({
        year,
        age,
        investment: runningValue,
        monthlySIP: currentYearMonthlySIP,
        annualSIP: currentYearAnnualSIP,
        goalsRequired,
        surplusDeficit,
      });
    }

    return projections;
  };

  const handleSaveGoal = () => {
    if (!goalFormData.name || !goalFormData.targetYear || !goalFormData.targetAmount) {
      return;
    }

    const targetAmountNum = parseFloat(goalFormData.targetAmount);
    const currentValueNum = parseFloat(goalFormData.currentValue) || 0;

    const newGoal: Goal = {
      id: editingGoal ? editingGoal.id : Date.now().toString(),
      name: goalFormData.name,
      targetYear: goalFormData.targetYear,
      targetAmount: formatAmount(targetAmountNum),
      currentValue: currentValueNum > 0 ? formatAmount(currentValueNum) : '₹0',
      yearsAway: calculateYearsAway(goalFormData.targetYear),
      category: goalFormData.category,
      icon: goalFormData.category === 'Retirement' ? 'target' : 'education',
    };

    if (editingGoal) {
      setGoals(goals.map((g) => (g.id === editingGoal.id ? newGoal : g)));
    } else {
      setGoals([...goals, newGoal]);
    }

    handleCloseGoalModal();
  };

  const handleCloseGoalModal = () => {
    setEditingGoal(null);
    setIsAddingGoal(false);
    setGoalFormData({
      name: '',
      category: 'Retirement',
      targetYear: '',
      targetAmount: '',
      currentValue: '0',
    });
  };

  const openAddGoalModal = () => {
    setGoalFormData({
      name: '',
      category: 'Retirement',
      targetYear: '',
      targetAmount: '',
      currentValue: '0',
    });
    setIsAddingGoal(true);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Processing Loader */}
      {isProcessing && <Loader fullScreen message="Processing your data..." />}
      
      {/* Goal Modal */}
      {(isAddingGoal || editingGoal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-2xl font-bold">{editingGoal ? 'Edit Goal' : 'Add New Goal'}</h2>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {editingGoal ? 'Update your financial target and timeline' : 'Set your financial target and timeline'}
                </p>
              </div>
              <button
                onClick={handleCloseGoalModal}
                className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors cursor-pointer`}
                aria-label="Close modal"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <form onSubmit={(e) => { e.preventDefault(); handleSaveGoal(); }} className="space-y-6">
                {/* Goal Name */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Goal Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={goalFormData.name}
                    onChange={(e) => handleGoalFormChange('name', e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                    placeholder="Child's Education"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={goalFormData.category}
                    onChange={(e) => handleGoalFormChange('category', e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                  >
                    <option value="Retirement">Retirement</option>
                    <option value="Education">Education</option>
                    <option value="House">House</option>
                    <option value="Vacation">Vacation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Target Year and Target Amount */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Target Year <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={new Date().getFullYear()}
                      value={goalFormData.targetYear}
                      onChange={(e) => handleGoalFormChange('targetYear', e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                      placeholder="2035"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Target Amount (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={goalFormData.targetAmount}
                      onChange={(e) => handleGoalFormChange('targetAmount', e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                      placeholder="5000000"
                    />
                  </div>
                </div>

                {/* Current Value */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Current Value (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={goalFormData.currentValue}
                    onChange={(e) => handleGoalFormChange('currentValue', e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                    placeholder="0"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseGoalModal}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors cursor-pointer ${
                      isDarkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors cursor-pointer"
                  >
                    {editingGoal ? 'Update Goal' : 'Add Goal'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-b border-gray-200`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {['dashboard', 'input', 'analysis'].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : `${isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-500 hover:text-gray-700'}`
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Access Message */}
      {showAccessMessage && (
        <div className={`${isDarkMode ? 'bg-yellow-900' : 'bg-yellow-50'} border-l-4 ${isDarkMode ? 'border-yellow-500' : 'border-yellow-400'} p-4 max-w-7xl mx-auto mt-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg
                className={`h-5 w-5 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-400'} mr-3`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className={`${isDarkMode ? 'text-yellow-200' : 'text-yellow-800'} font-medium`}>
                Please enter your financial information in the Input tab and click "Proceed" to access Dashboard or Analysis.
              </p>
            </div>
            <button
              onClick={() => {
                setShowAccessMessage(false);
                setActiveTab('input');
              }}
              className={`ml-4 ${isDarkMode ? 'text-yellow-400 hover:text-yellow-300' : 'text-yellow-600 hover:text-yellow-800'}`}
            >
              <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab Content */}
        {activeTab === 'dashboard' && (
          <>
            {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Current AUM */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Current AUM</span>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold">
              {formatAmount(parseFloat(financialProfile.currentAUM) || 0)}
            </p>
          </div>

          {/* Projected Wealth */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Projected Wealth</span>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <p className={`text-2xl font-bold ${calculateTotalProjectedWealth() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatAmount(calculateTotalProjectedWealth())}
            </p>
          </div>

          {/* Monthly SIP */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Monthly SIP</span>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-yellow-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold">
              {formatAmount(parseFloat(financialProfile.monthlySIP) || 0)}
            </p>
          </div>

          {/* Total Goals */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Goals</span>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-orange-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold">
              {formatAmount(calculateTotalGoalsAmount())}
            </p>
          </div>
        </div>

        {/* Charts and Goal Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Wealth Accumulation Projection */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
            <h2 className="text-lg font-bold mb-1">Wealth Accumulation Projection</h2>
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Your investment growth vs. goal requirements over time
            </p>
            <WealthProjectionChart projections={calculateYearByYearProjections().map(p => ({
              year: p.year,
              investment: p.investment,
              goalsRequired: p.goalsRequired,
            }))} />
          </div>

          {/* Goal Timeline */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
            <h2 className="text-lg font-bold mb-1">Goal Timeline</h2>
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Milestones on your financial journey
            </p>
            <div className="space-y-4">
              {goals.length === 0 ? (
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-8 text-center`}>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No goals added yet. Add goals in the Input tab to see timeline.
                  </p>
                </div>
              ) : (
                goals
                  .sort((a, b) => parseInt(a.targetYear) - parseInt(b.targetYear))
                  .map((goal) => {
                    const metrics = calculateGoalMetrics(goal);
                    const currentYear = new Date().getFullYear();
                    const yearsAway = parseInt(goal.targetYear) - currentYear;
                    const isAtRisk = !metrics.isOnTrack;

                    return (
                      <div
                        key={goal.id}
                        className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 border-l-4 ${
                          isAtRisk ? 'border-red-500' : 'border-green-500'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <svg
                              className={`w-5 h-5 ${isAtRisk ? 'text-red-500' : 'text-green-500'}`}
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              {isAtRisk ? (
                                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              ) : (
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              )}
                            </svg>
                            <h3 className="font-semibold">{goal.name}</h3>
                          </div>
                          <span
                            className={`${
                              isAtRisk ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            } text-xs font-semibold px-2 py-1 rounded`}
                          >
                            {isAtRisk ? 'At Risk' : 'On Track'}
                          </span>
                        </div>
                        <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {goal.targetYear} • {yearsAway} {yearsAway === 1 ? 'year' : 'years'} away
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Target (Adjusted)</p>
                            <p className="font-semibold">{formatAmount(metrics.adjustedTarget)}</p>
                          </div>
                          <div>
                            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Projected Value</p>
                            <p className="font-semibold">{formatAmount(metrics.projectedValue)}</p>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {metrics.isOnTrack ? 'Surplus' : 'Shortfall'}
                          </p>
                          <p
                            className={`text-lg font-bold ${
                              metrics.isOnTrack ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {metrics.isOnTrack ? '+' : '-'}
                            {formatAmount(Math.abs(metrics.shortfall))}
                          </p>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>

        {/* Year-by-Year Projections Table */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold mb-1">Year-by-Year Projections</h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Detailed breakdown of your wealth accumulation.
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} border-b border-gray-200`}>
                  <th className="px-4 py-3 text-left font-semibold">Year</th>
                  <th className="px-4 py-3 text-left font-semibold">Age</th>
                  <th className="px-4 py-3 text-left font-semibold">Investment Value</th>
                  <th className="px-4 py-3 text-left font-semibold">Monthly SIP</th>
                  <th className="px-4 py-3 text-left font-semibold">Annual SIP</th>
                  <th className="px-4 py-3 text-left font-semibold">Goals Required</th>
                  <th className="px-4 py-3 text-left font-semibold">Surplus/(Deficit)</th>
                </tr>
              </thead>
              <tbody>
                {calculateYearByYearProjections().map((row) => (
                  <tr
                    key={row.year}
                    className={`border-b border-gray-200 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-4 py-3">{row.year}</td>
                    <td className="px-4 py-3">{row.age}</td>
                    <td className="px-4 py-3 font-semibold">{formatAmount(row.investment)}</td>
                    <td className="px-4 py-3">{formatAmount(row.monthlySIP)}</td>
                    <td className="px-4 py-3">{formatAmount(row.annualSIP)}</td>
                    <td className="px-4 py-3">
                      {row.goalsRequired > 0 ? formatAmount(row.goalsRequired) : '-'}
                    </td>
                    <td
                      className={`px-4 py-3 font-semibold ${
                        row.surplusDeficit >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {row.goalsRequired > 0
                        ? `${row.surplusDeficit >= 0 ? '+' : ''}${formatAmount(row.surplusDeficit)}`
                        : formatAmount(row.surplusDeficit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
          </>
        )}

        {/* Input Tab Content */}
        {activeTab === 'input' && (
          <div className="space-y-8">
            {/* Financial Profile Card */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Financial Profile</h2>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Enter your current financial information
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={financialProfile.name}
                      onChange={(e) => handleProfileChange('name', e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                      placeholder="Enter your full name"
                    />
                    <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} min-h-[16px]`}>
                      {/* Spacer for alignment */}
                    </p>
                  </div>

                  {/* Current Age */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Current Age
                    </label>
                    <input
                      type="number"
                      value={financialProfile.currentAge}
                      onChange={(e) => handleProfileChange('currentAge', e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                      placeholder="30"
                    />
                    <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      Your current age in years
                    </p>
                  </div>

                  {/* Monthly SIP */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Monthly SIP (₹)
                    </label>
                    <input
                      type="number"
                      value={financialProfile.monthlySIP}
                      onChange={(e) => handleProfileChange('monthlySIP', e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                      placeholder="10000"
                    />
                    <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      Current monthly investment amount
                    </p>
                  </div>

                  {/* Expected Return */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Expected Return / CAGR (%)
                    </label>
                    <input
                      type="number"
                      value={financialProfile.expectedReturn}
                      onChange={(e) => handleProfileChange('expectedReturn', e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                      placeholder="12"
                    />
                    <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} min-h-[16px]`}>
                      {/* Spacer for alignment */}
                    </p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Mobile No. */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Mobile No. <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={financialProfile.mobileNo}
                      onChange={(e) => handleProfileChange('mobileNo', e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                      placeholder="Enter your mobile number"
                      maxLength={10}
                    />
                    <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      10-digit mobile number
                    </p>
                  </div>

                  {/* Current AUM */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Current AUM (₹)
                    </label>
                    <input
                      type="number"
                      value={financialProfile.currentAUM}
                      onChange={(e) => handleProfileChange('currentAUM', e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                      placeholder="500000"
                    />
                    <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      Total value of all investments
                    </p>
                  </div>

                  {/* Annual SIP Increase */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Annual SIP Increase (%)
                    </label>
                    <input
                      type="number"
                      value={financialProfile.annualSIPIncrease}
                      onChange={(e) => handleProfileChange('annualSIPIncrease', e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                      placeholder="10"
                    />
                    <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      Yearly increase in SIP amount
                    </p>
                  </div>

                  {/* Inflation Rate */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Inflation Rate (%)
                    </label>
                    <input
                      type="number"
                      value={financialProfile.inflationRate}
                      onChange={(e) => handleProfileChange('inflationRate', e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                      placeholder="6"
                    />
                    <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} min-h-[16px]`}>
                      {/* Spacer for alignment */}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Life Goals Section */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-orange-600"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Life Goals</h2>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Define your financial milestones
                    </p>
                  </div>
                </div>
                <button
                  onClick={openAddGoalModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2 cursor-pointer"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Goal</span>
                </button>
              </div>

              {/* Goals Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {goals.map((goal) => (
                  <div
                    key={goal.id}
                    className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-6 border border-gray-200`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        {goal.icon === 'target' ? (
                          <svg
                            className="w-5 h-5 text-orange-600"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5 text-blue-600"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M12 14l9-5-9-5-9 5 9 5z" />
                            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                          </svg>
                        )}
                        <div>
                          <h3 className="font-semibold">{goal.name}</h3>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Target: {goal.targetYear}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditGoal(goal)}
                          className="p-1 hover:bg-gray-600 rounded cursor-pointer"
                        >
                          <svg
                            className="w-4 h-4 text-gray-500"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="p-1 hover:bg-gray-600 rounded cursor-pointer"
                        >
                          <svg
                            className="w-4 h-4 text-red-500"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Target Amount
                        </span>
                        <span className="font-semibold">{goal.targetAmount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Current Value
                        </span>
                        <span className="font-semibold">{goal.currentValue}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          isDarkMode
                            ? 'bg-gray-600 text-gray-300'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {goal.yearsAway}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          goal.category === 'Retirement'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {goal.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-end">
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to reset all data? This will clear all financial information and goals.')) {
                    handleReset();
                  }
                }}
                className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                Reset
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-md cursor-pointer"
              >
                Proceed
              </button>
            </div>
          </div>
        )}

        {/* Analysis Tab Content */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Panel: Goal Feasibility Analysis */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-purple-600"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Goal Feasibility Analysis</h2>
                    <p className={`text-sm flex items-center space-x-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>
                        {goals.filter((goal) => {
                          const metrics = calculateGoalMetrics(goal);
                          return metrics.isOnTrack;
                        }).length} of {goals.length} goals are on track
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Overall Progress */}
              <div className="mb-6">
                {(() => {
                  const allMetrics = goals.map((goal) => calculateGoalMetrics(goal));
                  const totalFundingRatio = allMetrics.length > 0
                    ? allMetrics.reduce((sum, m) => sum + m.fundingRatio, 0) / allMetrics.length
                    : 0;
                  const overallProgress = Math.round(totalFundingRatio);

                  return (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Overall Progress
                        </span>
                        <span className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          {overallProgress}%
                        </span>
                      </div>
                      <div className={`w-full h-3 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all"
                          style={{ width: `${overallProgress}%` }}
                        ></div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Goal Cards */}
              <div className="space-y-4">
                {goals.length === 0 ? (
                  <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-8 text-center`}>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      No goals added yet. Add goals in the Input tab to see feasibility analysis.
                    </p>
                  </div>
                ) : (
                  goals.map((goal) => {
                    const metrics = calculateGoalMetrics(goal);
                    const currentYear = new Date().getFullYear();
                    const yearsAway = parseInt(goal.targetYear) - currentYear;

                    return (
                      <div
                        key={goal.id}
                        className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 border-l-4 ${
                          metrics.isOnTrack ? 'border-green-500' : 'border-red-500'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold mb-1">{goal.name}</h3>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Target: {goal.targetYear} • {yearsAway} years away
                            </p>
                          </div>
                          <span
                            className={`${
                              metrics.isOnTrack
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            } text-xs font-semibold px-2 py-1 rounded flex items-center space-x-1`}
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              {metrics.isOnTrack ? (
                                <path d="M5 13l4 4L19 7" />
                              ) : (
                                <path d="M4 6h16M4 12h16M4 18h16" />
                              )}
                            </svg>
                            <span>{metrics.isOnTrack ? 'On Track' : 'Shortfall'}</span>
                          </span>
                        </div>

                        <div className="space-y-2 mb-3">
                          <div className="flex justify-between text-sm">
                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Adjusted Target</span>
                            <span className="font-semibold">{formatAmount(metrics.adjustedTarget)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Projected Value</span>
                            <span className="font-semibold">{formatAmount(metrics.projectedValue)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                              {metrics.isOnTrack ? 'Surplus' : 'Shortfall'}
                            </span>
                            <span
                              className={`font-semibold ${
                                metrics.isOnTrack ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {metrics.isOnTrack ? '+' : '-'}
                              {formatAmount(Math.abs(metrics.shortfall))}
                            </span>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Funding Ratio
                            </span>
                            <span className="text-xs font-semibold">{Math.round(metrics.fundingRatio)}%</span>
                          </div>
                          <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                            <div
                              className={`h-2 rounded-full transition-all ${
                                metrics.isOnTrack ? 'bg-green-600' : 'bg-blue-600'
                              }`}
                              style={{ width: `${Math.min(100, metrics.fundingRatio)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Panel: Wealth Accumulation Projection */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Wealth Accumulation Projection</h2>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Your investment growth vs. goal requirements over time
                    </p>
                  </div>
                </div>
              </div>

              {/* Chart Container */}
              <WealthProjectionChart projections={calculateYearByYearProjections().map(p => ({
                year: p.year,
                investment: p.investment,
                goalsRequired: p.goalsRequired,
              }))} />
            </div>
            </div>

            {/* Goal Timeline Section - Below Chart */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Goal Timeline</h2>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Milestones on your financial journey
                    </p>
                  </div>
                </div>
              </div>

              {/* Goals Timeline List */}
              <div className="space-y-6">
                {goals.length === 0 ? (
                  <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-8 text-center`}>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      No goals added yet. Add goals in the Input tab to see timeline.
                    </p>
                  </div>
                ) : (
                  goals.map((goal, index) => {
                    const metrics = calculateGoalMetrics(goal);
                    const isAtRisk = !metrics.isOnTrack;

                    // Calculate years away
                    const currentYear = new Date().getFullYear();
                    const yearsAway = parseInt(goal.targetYear) - currentYear;

                  return (
                    <div key={goal.id} className="flex items-start space-x-4 relative">
                      {/* Timeline Indicator */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isAtRisk ? 'bg-red-100' : 'bg-green-100'
                          }`}
                        >
                          <svg
                            className={`w-5 h-5 ${isAtRisk ? 'text-red-600' : 'text-green-600'}`}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        {index < goals.length - 1 && (
                          <div
                            className={`w-0.5 h-full min-h-24 ${
                              isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
                            }`}
                            style={{ marginTop: '0.5rem' }}
                          />
                        )}
                      </div>

                      {/* Goal Content */}
                      <div className="flex-1">
                        <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold mb-1">{goal.name}</h3>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {goal.targetYear} • {yearsAway} years away
                              </p>
                            </div>
                            {isAtRisk ? (
                              <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded">
                                At Risk
                              </span>
                            ) : (
                              <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded">
                                On Track
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Target (Adjusted)
                              </p>
                              <p className="font-semibold">{formatAmount(metrics.adjustedTarget)}</p>
                            </div>
                            <div>
                              <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Projected Value
                              </p>
                              <p className="font-semibold">{formatAmount(metrics.projectedValue)}</p>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                            <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {metrics.isOnTrack ? 'Surplus' : 'Shortfall'}
                            </p>
                            <p
                              className={`text-lg font-bold ${
                                metrics.isOnTrack ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {metrics.isOnTrack ? '+' : '-'}
                              {formatAmount(Math.abs(metrics.shortfall))}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

