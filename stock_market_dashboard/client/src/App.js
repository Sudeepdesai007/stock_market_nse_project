/**
 * @file App.js
 * @description Main application component for the Stock Market Dashboard.
 * This component manages the overall application state, including:
 * - User input (stock symbol).
 * - Fetched stock data (profile, financials, historical, technicals).
 * - Loading and error states for API calls.
 * - Active UI tab and other UI-related states (e.g., expanded sections).
 * It orchestrates API calls, data transformation (via apiAdapter and utils),
 * and renders various sub-components that form the dashboard interface.
 * It also handles UI interactions like tab switching and search submission.
 */
import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react'; 
import './App.css';
import './styles/base.css'; // Global base styles
import './styles/animations.css'; // Global animations
import './styles/content.css'; // General content area styles
import './styles/utilities.css'; // Utility and helper classes
import './styles/responsive.css'; // Responsive adjustments
import './components/Layout/Layout.css'; // App layout styles
import './components/StockSearchForm/StockSearchForm.css'; // Styles for the StockSearchForm
import './components/Card/Card.css'; // Styles for Cards
import './components/Table/Table.css'; // Styles for Tables
import './components/common/InfoTooltip.css'; // Styles for InfoTooltip
import './components/Tabs/Tabs.css'; // Styles for Tabs
// import './components/ErrorBoundary/ErrorBoundary.css'; // CSS for ErrorBoundary (component imports its own CSS)
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  BarElement,
  BarController,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import {
  DEFAULT_NA_STRING,
  getSafe,
  formatToCrores,
  formatPercentage,
  formatRatio,
  formatCurrency,
  calculateTenure,
  findFinancialByYear,
  calculateYoYGrowth,
  calculateCAGR,
  // getPrimaryCompanyDataFromPeerList, // Removed as no longer used in App.js
  // calculateSMA, // Moved to useTechnicalAnalysis
  // calculateEMA, // Moved to useTechnicalAnalysis
  // calculateRSI, // Moved to useTechnicalAnalysis
  // calculateBollingerBands, // Moved to useTechnicalAnalysis
  calculateOverallSentimentMetrics,
  calculateKeyTechnicalIndicators,
  calculatePeerAverage,
  getPeerComparisonDetails,
  calculateProfitabilityMetrics,
  calculateCashFlowHealthMetrics,
  calculateAdvancedCashFlowInsights,
  calculateFinancialHealthAndDebtMetrics,
  calculateAssetQualityInsights,
  calculateShareholderReturnsMetrics,
  calculateShareCapitalInsights,
  calculateEfficiencyRatios,
  calculateOperationalEfficiencyMetrics,
  calculateGrowthTrendsMetrics,
  calculateHistoricalPerformanceMetrics,
  calculateLiquidityRatios,
  calculateValuationMetrics
} from './utils';
// API related constants are used within hooks now
// import {
//   EXTERNAL_API_BASE_URL,
//   HISTORICAL_API_BASE_URL,
//   PRIMARY_API_KEY,
//   BACKUP_API_KEY
// } from './constants';
// import { transformStockDataApiResponse } from './apiAdapter'; // Used within useStockDataApi hook

import useStockDataApi from './hooks/useStockDataApi';
import useHistoricalDataApi from './hooks/useHistoricalDataApi';
import useTechnicalAnalysis from './hooks/useTechnicalAnalysis';
import useCategorizedMetrics from './hooks/useCategorizedMetrics';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';

// Lazy load components
const WelcomeMessage = lazy(() => import('./components/WelcomeMessage'));
const CompanyDetailsTab = lazy(() => import('./components/CompanyDetailsTab'));
const HistoricalDataTab = lazy(() => import('./components/HistoricalDataTab'));
const AnalysisTab = lazy(() => import('./components/AnalysisTab'));
const KeyMetricsTab = lazy(() => import('./components/KeyMetricsTab'));
const StockSearchForm = lazy(() => import('./components/StockSearchForm/StockSearchForm'));


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  BarElement,
  BarController
);

function App() {
  // Use the custom hook for stock data API logic
  const {
    symbol,
    stockData,
    loading,
    error,
    fetchStockData,
    handleSymbolChange,
    // setError // Not directly used in App.js anymore, errors are handled by the hook
  } = useStockDataApi();

  // State to manage the expansion of the company profile description text
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  // State to track which metric categories (e.g., Profitability, Valuation) are expanded by the user in the UI
  const [expandedMetricCategories, setExpandedMetricCategories] = useState({});

  // State for the currently active tab (e.g., 'companyDetails', 'keyMetrics', 'historicalData', 'analysis')
  const [activeTab, setActiveTab] = useState('companyDetails');

  // Use the custom hook for historical data API logic
  const {
    historicalData,
    historicalLoading,
    historicalError,
    historicalPeriod,
    setHistoricalPeriod,
    historicalFilter,
    setHistoricalFilter,
    fetchHistoricalData, // This is used in a useEffect below
    setHistoricalError, 
    setHistoricalData   
  } = useHistoricalDataApi(symbol, stockData); 

  // Use the custom hook for technical analysis
  const {
    analysisData,
    technicalSignal,
    analysisLoading
  } = useTechnicalAnalysis(historicalData, stockData, activeTab, historicalError, historicalFilter);

  // State to control the visibility of the scroll-to-top button based on scroll position
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [tabContentReady, setTabContentReady] = useState({
    companyDetails: true, // Assuming this is light enough or default active to be ready
    keyMetrics: false,
    historicalData: false,
    analysis: false,
  });


  // Refs for tab panels to manage focus on tab change, enhancing accessibility.
  const companyDetailsPanelRef = useRef(null); 
  const keyMetricsPanelRef = useRef(null);     
  const historicalDataPanelRef = useRef(null); 
  const analysisPanelRef = useRef(null);       

  const prevActiveTabRef = useRef();
  const prevTabContentReadyRef = useRef();

  const memoizedGetSafe = useCallback(getSafe, []);
  const memoizedFindFinancialByYear = useCallback(findFinancialByYear, []); 
  const memoizedFormatToCrores = useCallback(formatToCrores, []);
  const memoizedFormatPercentage = useCallback(formatPercentage, []);
  const memoizedFormatRatio = useCallback(formatRatio, []);
  const memoizedFormatCurrency = useCallback(formatCurrency, []);
  const memoizedCalculateYoYGrowth = useCallback(calculateYoYGrowth, []); 
  const memoizedCalculateCAGR = useCallback(calculateCAGR, []);          
  const memoizedCalculateTenure = useCallback(calculateTenure, []);

  // Metric calculation functions for categorizedMetrics useEffect dependency array
  const memoizedCalculateProfitabilityMetrics = useCallback(calculateProfitabilityMetrics, []);
  const memoizedCalculateValuationMetrics = useCallback(calculateValuationMetrics, []);
  const memoizedCalculateCashFlowHealthMetrics = useCallback(calculateCashFlowHealthMetrics, []);
  const memoizedCalculateAdvancedCashFlowInsights = useCallback(calculateAdvancedCashFlowInsights, []);
  const memoizedCalculateFinancialHealthAndDebtMetrics = useCallback(calculateFinancialHealthAndDebtMetrics, []);
  const memoizedCalculateAssetQualityInsights = useCallback(calculateAssetQualityInsights, []);
  const memoizedCalculateShareholderReturnsMetrics = useCallback(calculateShareholderReturnsMetrics, []);
  const memoizedCalculateShareCapitalInsights = useCallback(calculateShareCapitalInsights, []);
  const memoizedCalculateEfficiencyRatios = useCallback(calculateEfficiencyRatios, []);
  const memoizedCalculateOperationalEfficiencyMetrics = useCallback(calculateOperationalEfficiencyMetrics, []);
  const memoizedCalculateGrowthTrendsMetrics = useCallback(calculateGrowthTrendsMetrics, []);
  const memoizedCalculateHistoricalPerformanceMetrics = useCallback(calculateHistoricalPerformanceMetrics, []);
  const memoizedCalculateLiquidityRatios = useCallback(calculateLiquidityRatios, []);
  const memoizedCalculateKeyTechnicalIndicators = useCallback(calculateKeyTechnicalIndicators, []);
  const memoizedCalculateOverallSentimentMetrics = useCallback(calculateOverallSentimentMetrics, []);
  const memoizedCalculatePeerAverage = useCallback(calculatePeerAverage, []);
  const memoizedGetPeerComparisonDetails = useCallback(getPeerComparisonDetails, []);

  const handleContentLoaded = useCallback((tabId) => {
    setTabContentReady(prev => ({ ...prev, [tabId]: true }));
  }, []);

  // UI state and simple toggles that remain in App.js
  const toggleProfileExpanded = useCallback(() => {
    setIsProfileExpanded(prev => !prev); // setIsProfileExpanded is used here
  }, [setIsProfileExpanded]); // Added setIsProfileExpanded to dependency array for clarity, though it's stable

  const toggleMetricCategoryExpansion = useCallback((categoryKey) => {
    setExpandedMetricCategories(prev => ({ ...prev, [categoryKey]: !prev[categoryKey] }));
  }, []);

  // Configuration for displaying metric categories in the UI.
  // `categoryDisplayTitles` maps internal category keys to user-friendly titles.
  // `categoryOrder` defines the sequence in which these categories should be rendered.
  const categoryDisplayTitles = {
    profitability: "📈 Profitability Metrics",
    valuation: "⚖️ Valuation Metrics",
    cashFlowHealth: "💧 Cash Flow Health",
    financialHealthDebt: "🛡️ Financial Health & Debt",
    efficiencyRatios: "⚙️ Efficiency Ratios",
    growthTrends: "🚀 Growth Trends (YoY %)",
    liquidity: "🩸 Liquidity Ratios",
    shareholderReturns: "🎁 Shareholder Returns",
    technicalData: "📊 Key Technical Indicators",
    overallSentiment: "🗣️ Overall Sentiment",
    advancedCashFlow: "🌊 Advanced Cash Flow Insights",
    shareCapital: "⚖️ Share Capital Insights",
    assetQuality: "🧱 Asset Quality Insights",
    operationalEfficiency: "📦 Operational Efficiency",
    historicalPerformance: "📜 Historical Performance"
  };
  const categoryOrder = [
    'valuation', 'technicalData', 'profitability', 'cashFlowHealth', 
    'advancedCashFlow',
    'financialHealthDebt', 'assetQuality',
    'shareholderReturns', 'shareCapital',
    'efficiencyRatios', 'operationalEfficiency',
    'growthTrends', 'historicalPerformance', 'liquidity', 'overallSentiment'
  ];
  // Defines which metric categories are collapsible in the UI. Currently, all are.
  const COLLAPSIBLE_CATEGORIES = [...categoryOrder]; // By default, all categories are collapsible

  // Use the custom hook for categorized metrics
  const categorizedMetrics = useCategorizedMetrics(
    stockData,
    memoizedGetSafe,
        memoizedFindFinancialByYear,
        memoizedFormatToCrores,
    memoizedFormatPercentage,
        memoizedFormatRatio,
        memoizedFormatCurrency,
    memoizedCalculateYoYGrowth,
    memoizedCalculateCAGR,
    memoizedCalculateProfitabilityMetrics,
    memoizedCalculateValuationMetrics,
    memoizedCalculateCashFlowHealthMetrics,
    memoizedCalculateAdvancedCashFlowInsights,
    memoizedCalculateFinancialHealthAndDebtMetrics,
    memoizedCalculateAssetQualityInsights,
    memoizedCalculateShareholderReturnsMetrics,
    memoizedCalculateShareCapitalInsights,
    memoizedCalculateEfficiencyRatios,
    memoizedCalculateOperationalEfficiencyMetrics,
    memoizedCalculateGrowthTrendsMetrics,
    memoizedCalculateHistoricalPerformanceMetrics,
    memoizedCalculateLiquidityRatios,
    memoizedCalculateKeyTechnicalIndicators,
    memoizedCalculateOverallSentimentMetrics,
    memoizedCalculatePeerAverage,
        memoizedGetPeerComparisonDetails
      );

  // Configuration for tabs - Component references will be the lazy-loaded ones
  const tabsConfig = [
    { id: 'companyDetails', label: 'Company Details', icon: '🏢', component: CompanyDetailsTab, ref: companyDetailsPanelRef },
    { id: 'keyMetrics', label: 'Key Metrics', icon: '📈', component: KeyMetricsTab, ref: keyMetricsPanelRef },
    { id: 'historicalData', label: 'Historical Data', icon: '📜', component: HistoricalDataTab, ref: historicalDataPanelRef },
    { id: 'analysis', label: '🔬 Technical Analysis', icon: '🔬', component: AnalysisTab, ref: analysisPanelRef }
  ];

/**
 * useEffect hook for triggering historical data fetching.
 * This effect runs when the active tab, symbol, main stockData, historical period, or filter changes.
 * It calls `fetchHistoricalData` if:
 *  - The 'historicalData' tab is active, OR the `historicalFilter` is 'price' (as price data is needed for the 'analysis' tab too).
 *  - A stock symbol is entered and `stockData` has been loaded (to ensure context).
 *  - The currently loaded `historicalData` (if any) does not match the `targetQueryKey` (a combination of symbol, period, and filter),
 *    preventing redundant fetches if the correct data is already present.
 * It also manages `historicalLoading` and `historicalError` states appropriately if data is already available and matches the query.
 */
  useEffect(() => {
    if ((activeTab === 'historicalData' || historicalFilter === 'price') && symbol && stockData) {
      const targetQueryKey = `${symbol.toUpperCase()}-${historicalPeriod}-${historicalFilter}`;
      if (historicalData && historicalData.queryKey === targetQueryKey) {
        return;
      }
      fetchHistoricalData(); // Call the function from the hook
    }
  }, [activeTab, symbol, stockData, historicalPeriod, historicalFilter, fetchHistoricalData, historicalData]);

  const handleSubmit = (eventOrSymbol) => {
    // Check if the first argument is an event (from form submit) or a symbol string (from suggestion click)
    let symbolToFetch = '';
    if (typeof eventOrSymbol === 'string') {
      symbolToFetch = eventOrSymbol;
      // If called directly with a symbol, we might not have an event to preventDefault on.
    } else if (eventOrSymbol && typeof eventOrSymbol.preventDefault === 'function') {
      eventOrSymbol.preventDefault();
      symbolToFetch = symbol.trim(); // Use the current symbol state from useStockDataApi
    } else {
      // Fallback or error, though ideally this case shouldn't be hit if called correctly.
      symbolToFetch = symbol.trim();
    }

    if (!symbolToFetch) return; // Do nothing if no symbol to fetch

    fetchStockData(symbolToFetch);
    setHistoricalData(null);
    setHistoricalError(null);
    setTabContentReady(prev => ({ 
      companyDetails: true, // Or false if it also reloads significantly
      keyMetrics: false, 
      historicalData: false, 
      analysis: false 
    }));
  };

  const handleExampleClick = (exampleSymbol) => {
    handleSymbolChange(exampleSymbol); 
    fetchStockData(exampleSymbol);
    setHistoricalData(null);
    setHistoricalError(null);
    setTabContentReady(prev => ({ 
      companyDetails: true, // Or false if it also reloads significantly
      keyMetrics: false, 
      historicalData: false, 
      analysis: false 
    }));
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollToTop(true);
      } else {
        setShowScrollToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
    behavior: 'smooth' 
    });
  };

  useEffect(() => {
    let panelToFocus = null;
    if (activeTab === 'companyDetails' && companyDetailsPanelRef.current) {
      panelToFocus = companyDetailsPanelRef.current;
    } else if (activeTab === 'keyMetrics' && keyMetricsPanelRef.current) {
      panelToFocus = keyMetricsPanelRef.current;
    } else if (activeTab === 'historicalData' && historicalDataPanelRef.current) {
      panelToFocus = historicalDataPanelRef.current;
    } else if (activeTab === 'analysis' && analysisPanelRef.current) {
      panelToFocus = analysisPanelRef.current;
    }

    const currentTabKey = activeTab;
    const tabJustSwitched = prevActiveTabRef.current !== currentTabKey;
    
    const prevContentWasReady = prevTabContentReadyRef.current && prevTabContentReadyRef.current[currentTabKey];
    const contentJustLoaded = !prevContentWasReady && tabContentReady[currentTabKey];

    if (panelToFocus && tabContentReady[currentTabKey] && (tabJustSwitched || contentJustLoaded)) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (panelToFocus && panelToFocus.focus) {
            panelToFocus.focus({ preventScroll: true });
          }
          if (panelToFocus) {
            panelToFocus.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 0);
      });
    }
    
    prevActiveTabRef.current = activeTab;
    prevTabContentReadyRef.current = tabContentReady;

  }, [activeTab, tabContentReady]);

  // Main render method for the App component.
  return (
    <div className="App">
      <header className="App-header">
        <div className="logo-placeholder" aria-hidden="true">
          <span role="img" aria-label="Stock chart icon">📈</span>
        </div>
        <h1>Indian Stock Market Dashboard</h1>
      
        <Suspense fallback={<div className="card simple-loading">Loading Search...</div>}>
        <StockSearchForm 
          symbol={symbol}
            onSymbolChange={handleSymbolChange} 
          onSubmit={handleSubmit}
          loading={loading}
          showHint={!loading && !stockData && !error && symbol.trim() === ''}
        />
        </Suspense>

      </header>
        {loading && (
          <div className="card loading-indicator-card">
            <div className="spinner"></div>
            <h4>Loading data for {symbol.toUpperCase()}...</h4>
                </div>
            )}

        {error && !loading && (
          <div className="card error-message-card">
            <h4>⚠️ Error Fetching Data</h4>
            <p>{error}</p> 
              </div>
            )}

        {!stockData && !loading && !error && (
          <Suspense fallback={<div className="card simple-loading">Loading Welcome...</div>}>
          <WelcomeMessage 
              loading={loading} 
              handleExampleClick={handleExampleClick} 
          />
          </Suspense>
        )}

        {stockData && Object.keys(categorizedMetrics).length > 0 && (
          <ErrorBoundary>
          <div className="stock-data-container">
          <h2>{stockData.companyProfile.name || DEFAULT_NA_STRING} 
            {stockData.currentPrice && stockData.currentPrice.symbol && ` (${stockData.currentPrice.symbol})`}
          </h2>
            
          <nav className="tabs-navigation" aria-label="Stock data categories">
            {tabsConfig.map(tab => (
              <button
                key={tab.id}
                  id={`${tab.id}-button`} 
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                aria-controls={`${tab.id}-panel`}
                aria-selected={activeTab === tab.id}
                role="tab"
              >
                  {tab.icon && <span className="tab-icon" aria-hidden="true">{tab.icon}</span>}
                  {tab.label.replace(/^🔬\s*/, '')}
              </button>
            ))}
          </nav>

            <Suspense fallback={<div className="card card-full-width simple-loading">Loading Tab Content...</div>}>
          {tabsConfig.map(tab => (
            activeTab === tab.id && (
              <div
                key={tab.id}
                id={`${tab.id}-panel`}
                className="card tab-panel"
                role="tabpanel"
                    tabIndex={-1} 
                aria-labelledby={`${tab.id}-button`}
                ref={tab.ref}
              >
                    <tab.component 
                  stockData={stockData}
                  categorizedMetrics={categorizedMetrics}
                      isLoading={loading} 
                  isProfileExpanded={isProfileExpanded}
                  toggleProfileExpanded={toggleProfileExpanded}
                  expandedMetricCategories={expandedMetricCategories}
                  toggleMetricCategoryExpansion={toggleMetricCategoryExpansion}
                  categoryDisplayTitles={categoryDisplayTitles}
                  categoryOrder={categoryOrder}
                  COLLAPSIBLE_CATEGORIES={COLLAPSIBLE_CATEGORIES}
                  historicalData={historicalData}
                  historicalLoading={historicalLoading}
                  historicalError={historicalError}
                  historicalPeriod={historicalPeriod}
                  setHistoricalPeriod={setHistoricalPeriod}
                  historicalFilter={historicalFilter}
                  setHistoricalFilter={setHistoricalFilter}
                      Line={Line} 
                  analysisData={analysisData}
                      analysisLoading={analysisLoading || (historicalLoading && activeTab === 'analysis' && historicalFilter === 'price')} 
                  technicalSignal={technicalSignal}
                  formatToCrores={memoizedFormatToCrores}
                  formatPercentage={memoizedFormatPercentage}
                  formatRatio={memoizedFormatRatio}
                  formatCurrency={memoizedFormatCurrency}
                  calculateTenure={memoizedCalculateTenure}
                  getSafe={memoizedGetSafe}
                  tabId={tab.id} // Pass tabId
                  onContentLoaded={handleContentLoaded} // Pass callback
                />
              </div>
            )
          ))}
            </Suspense>
        </div>
          </ErrorBoundary>
      )}

      {showScrollToTop && (
        <button onClick={scrollToTop} className="scroll-to-top-button" aria-label="Scroll to top" title="Scroll to top">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" aria-hidden="true" focusable="false">
            <path d="M0 0h24v24H0V0z" fill="none"/>
            <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z"/>
          </svg>
        </button>
      )}
    </div>
  );
}

export default App;