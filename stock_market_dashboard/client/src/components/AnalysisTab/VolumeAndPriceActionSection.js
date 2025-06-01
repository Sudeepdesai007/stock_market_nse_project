import React from 'react';
import PropTypes from 'prop-types';
import { AnalysisMetricDisplayItem } from './common';

const VolumeAndPriceActionSection = ({
  dailyAnalysis,
  weeklyAnalysis,
  monthlyAnalysis,
  formatCurrency,
  DEFAULT_NA_STRING,
}) => {
  if (!dailyAnalysis && !weeklyAnalysis && !monthlyAnalysis) {
    return null;
  }

  const renderTimeframeVolumeMetrics = (analysis, timeframeLabel) => {
    if (!analysis || analysis.error) {
      if (timeframeLabel !== 'Daily' && analysis?.error) {
        return <p className="timeframe-error-text">{timeframeLabel} Volume/Price data not available: {analysis.error}</p>;
      }
      return null;
    }

    const hasData = analysis.vwap !== null || analysis.volumeSMA !== null || analysis.obv !== null;
    if (!hasData && timeframeLabel === 'Daily') return null;
    if (!hasData && timeframeLabel !== 'Daily') return null;

    return (
      <>
        <h5 className="timeframe-subheader">{timeframeLabel}</h5>
        <div className="analysis-metric-grid sub-grid">
          {analysis.vwap !== null && (
            <AnalysisMetricDisplayItem 
              label={`VWAP (20${timeframeLabel === 'Daily' ? 'D' : 'P'})`} 
              value={formatCurrency(analysis.vwap).value ?? DEFAULT_NA_STRING} 
            />
          )}
          {analysis.volumeSMA !== null && (
            <AnalysisMetricDisplayItem 
              label={`Volume SMA (20${timeframeLabel === 'Daily' ? 'D' : 'P'})`} 
              value={parseFloat(analysis.volumeSMA).toLocaleString(undefined, {maximumFractionDigits:0}) ?? DEFAULT_NA_STRING} 
              unit="shares" 
            />
          )}
          {analysis.obv !== null && (
            <AnalysisMetricDisplayItem 
              label="OBV" 
              value={parseFloat(analysis.obv).toLocaleString(undefined, {maximumFractionDigits:0}) ?? DEFAULT_NA_STRING} 
            />
          )}
        </div>
      </>
    );
  };

  return (
    <div className="indicator-section-card">
      <h4>Volume & Price Action
        <span className="info-icon-container" aria-label="Volume & Price Action Explanation" tabIndex={0}>
            <span className="info-icon" />
            <span className="tooltip-text">
                <p><strong>VWAP:</strong> Volume-Weighted Average Price over a period; a trader benchmark.</p>
                <p><strong>Volume SMA:</strong> Moving average of trading volume; helps identify unusual volume.</p>
                <p><strong>OBV (On-Balance Volume):</strong> Momentum indicator using volume flow. Rising OBV can suggest positive pressure.</p>
            </span>
        </span>
      </h4>
      {renderTimeframeVolumeMetrics(dailyAnalysis, 'Daily')}
      {renderTimeframeVolumeMetrics(weeklyAnalysis, 'Weekly')}
      {renderTimeframeVolumeMetrics(monthlyAnalysis, 'Monthly')}
    </div>
  );
};

VolumeAndPriceActionSection.propTypes = {
  dailyAnalysis: PropTypes.object,
  weeklyAnalysis: PropTypes.object,
  monthlyAnalysis: PropTypes.object,
  formatCurrency: PropTypes.func.isRequired,
  DEFAULT_NA_STRING: PropTypes.string.isRequired,
};

VolumeAndPriceActionSection.defaultProps = {
  dailyAnalysis: null,
  weeklyAnalysis: null,
  monthlyAnalysis: null,
};

export default React.memo(VolumeAndPriceActionSection); 