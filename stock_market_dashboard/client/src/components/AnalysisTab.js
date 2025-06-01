import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import './AnalysisTab/AnalysisTab.css';
import MovingAveragesSection from './AnalysisTab/MovingAveragesSection';
import OscillatorsAndBandsSection from './AnalysisTab/OscillatorsAndBandsSection';
import VolumeAndPriceActionSection from './AnalysisTab/VolumeAndPriceActionSection';
import TechnicalSignalDisplaySection from './AnalysisTab/TechnicalSignalDisplaySection';

/**
 * @file AnalysisTab.js
 * @description Component for the "Technical Analysis" tab. It displays various technical indicators
 * such as Moving Averages (SMA, EMA), Oscillators (RSI), Bollinger Bands, and an overall
 * technical sentiment signal based on these indicators. It also includes explanations for these metrics.
 */

// Helper functions (parseFactorReason, getSentimentStyleAndIcon, FactorDot) and constants (SIGNAL_ERROR, etc.) 
// have been moved to TechnicalSignalDisplaySection.js

// AnalysisMetricDisplayItem and MovingAverageItem have been moved to ./AnalysisTab/common.js

/**
 * Internal main component for the Analysis Tab.
 * @param {object} props - Component props.
 * @param {boolean} props.analysisLoading - Indicates if analysis data is currently being calculated.
 * @param {object|null} props.analysisData - Object containing calculated analysis data (SMAs, EMAs, RSI, Bollinger Bands), or an error object.
 * @param {object|null} props.technicalSignal - Object containing the overall technical sentiment signal, reasons, and scores.
 * @param {object|null} props.historicalData - Used to determine if a fallback message for analysis should be shown if historical data itself is missing.
 * @param {function} props.formatCurrency - Utility function to format currency values.
 * @param {string} props.DEFAULT_NA_STRING - Default string for N/A values.
 * @param {string} props.tabId - The ID of the tab.
 * @param {function} props.onContentLoaded - Function to call when content is loaded.
 */
const AnalysisTabInternal = ({
  analysisLoading,
  analysisData, // This will now have .daily, .weekly, .monthly structure
  technicalSignal,
  historicalData, // Used to determine if a fallback message for analysis should be shown if historical data itself is missing.
  formatCurrency, 
  DEFAULT_NA_STRING,
  tabId,
  onContentLoaded
}) => {
  useEffect(() => {
    if (onContentLoaded) {
      if (analysisLoading) {
        onContentLoaded(tabId);
      } else if (analysisData && (analysisData.error || analysisData.daily?.error)) { // Check overall or daily error
        onContentLoaded(tabId);
      } else if (analysisData && analysisData.daily && analysisData.daily.smas) { // Check if daily data is available
        onContentLoaded(tabId);
      } else if (analysisData && !analysisData.daily?.smas && !analysisLoading) { // Catch-all for other non-error, non-data, non-loading states for daily
         onContentLoaded(tabId);
      }
      // Add more robust checks for weekly/monthly if needed for onContentLoaded, or rely on daily completion.
    }
  }, [analysisLoading, analysisData, tabId, onContentLoaded]);

  let content;
  const dailyAnalysis = analysisData?.daily;
  const weeklyAnalysis = analysisData?.weekly;
  const monthlyAnalysis = analysisData?.monthly;

  if (analysisLoading) {
    content = ( <div className="tab-content-spinner-container"><div className="spinner"></div><p>Generating analysis...</p></div> );
  } else if (analysisData?.error) { // Overall error from the hook itself
    content = ( <div className="analysis-status-message error"><h4>⚠️ Analysis Error</h4><p>{analysisData.error}</p></div> );
  } else if (dailyAnalysis?.error) { // Error specific to daily calculation (might also affect weekly/monthly)
    content = ( <div className="analysis-status-message error"><h4>⚠️ Daily Analysis Error</h4><p>{dailyAnalysis.error}</p></div> );
  } else if (dailyAnalysis && dailyAnalysis.smas) { // Proceed if daily SMAs are present (implies basic data processed)
    content = (
      <div className="analysis-results">
        <MovingAveragesSection 
          dailyAnalysis={dailyAnalysis} 
          weeklyAnalysis={weeklyAnalysis} 
          monthlyAnalysis={monthlyAnalysis}
          formatCurrency={formatCurrency}
          DEFAULT_NA_STRING={DEFAULT_NA_STRING}
        />

        <OscillatorsAndBandsSection 
          dailyAnalysis={dailyAnalysis}
          weeklyAnalysis={weeklyAnalysis}
          monthlyAnalysis={monthlyAnalysis}
          DEFAULT_NA_STRING={DEFAULT_NA_STRING}
        />

        <VolumeAndPriceActionSection 
          dailyAnalysis={dailyAnalysis}
          weeklyAnalysis={weeklyAnalysis}
          monthlyAnalysis={monthlyAnalysis}
          formatCurrency={formatCurrency}
          DEFAULT_NA_STRING={DEFAULT_NA_STRING}
        />
    </div>
    );
  } else {
    // Fallback if analysisData or daily.smas is not ready and not loading/error
    content = (
      <div className="analysis-status-message warning">
        <h4>🔎 Analysis Pending</h4>
        <p>Load stock data and ensure historical price & volume data are available for all timeframes.</p>
      </div>
    );
  }

  return (
    <div 
      id="panel-analysis" 
      role="tabpanel" 
      aria-labelledby="tab-analysis" 
      className="tab-panel analysis-tab-content card"
    >
      <h3>🔬 Technical Analysis</h3>
      <TechnicalSignalDisplaySection 
        technicalSignal={technicalSignal} 
        DEFAULT_NA_STRING={DEFAULT_NA_STRING} 
      />
      {content} 
    </div>
  );
};

AnalysisTabInternal.propTypes = {
  analysisLoading: PropTypes.bool.isRequired,
  analysisData: PropTypes.object, 
  technicalSignal: PropTypes.object,
  historicalData: PropTypes.object, 
  formatCurrency: PropTypes.func.isRequired,
  DEFAULT_NA_STRING: PropTypes.string.isRequired,
  tabId: PropTypes.string.isRequired,
  onContentLoaded: PropTypes.func.isRequired,
};

AnalysisTabInternal.defaultProps = {
  analysisData: null,    
  technicalSignal: null,  
  historicalData: null,   
};

AnalysisTabInternal.displayName = 'AnalysisTab';

const AnalysisTab = React.memo(AnalysisTabInternal);

export default AnalysisTab; 