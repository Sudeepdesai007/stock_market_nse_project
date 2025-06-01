import React from 'react';
import PropTypes from 'prop-types';
import { AnalysisMetricDisplayItem } from './common';

const OscillatorsAndBandsSection = ({
  dailyAnalysis,
  weeklyAnalysis,
  monthlyAnalysis,
  DEFAULT_NA_STRING,
}) => {
  if (!dailyAnalysis && !weeklyAnalysis && !monthlyAnalysis) {
    return null;
  }

  const renderTimeframeOscillators = (analysis, timeframeLabel) => {
    if (!analysis || analysis.error) {
      if (timeframeLabel !== 'Daily' && analysis?.error) { // Only show error for weekly/monthly if present
        return <p className="timeframe-error-text">{timeframeLabel} Oscillator/Band data not available: {analysis.error}</p>;
      }
      return null; // Don't render if daily has error or no data for the timeframe at all
    }

    const hasData = analysis.rsi || analysis.bollingerBands || analysis.macd;
    if (!hasData && timeframeLabel === 'Daily') return null; // if daily has no osc data, don't render section for daily
    if (!hasData && timeframeLabel !== 'Daily') return null; // if weekly/monthly has no osc data, don't render for them
    
    return (
      <>
        <h5 className="timeframe-subheader">{timeframeLabel}</h5>
        <div className="analysis-metric-grid oscillator-bands-grid sub-grid">
          {analysis.rsi && (
            <AnalysisMetricDisplayItem 
              label="RSI (14)" 
              value={analysis.rsi.value ?? DEFAULT_NA_STRING} 
              colorClass={analysis.rsi.colorClass} 
            />
          )}
          {/* Bollinger Bands */}
          <AnalysisMetricDisplayItem label="BB Upper" value={analysis.bollingerBands?.upper ?? DEFAULT_NA_STRING} />
          <AnalysisMetricDisplayItem label="BB Middle" value={analysis.bollingerBands?.middle?.value ?? DEFAULT_NA_STRING} colorClass={analysis.bollingerBands?.middle?.colorClass} />
          <AnalysisMetricDisplayItem label="BB Lower" value={analysis.bollingerBands?.lower ?? DEFAULT_NA_STRING} />
          
          {/* MACD */}
          <AnalysisMetricDisplayItem 
            label="MACD" 
            value={(analysis.macd?.macd !== undefined && analysis.macd?.macd !== null) ? analysis.macd.macd.toFixed(2) : DEFAULT_NA_STRING} 
          />
          <AnalysisMetricDisplayItem 
            label="Signal Line" 
            value={(analysis.macd?.signal !== undefined && analysis.macd?.signal !== null) ? analysis.macd.signal.toFixed(2) : DEFAULT_NA_STRING} 
          />
          <AnalysisMetricDisplayItem 
            label="Histogram" 
            value={(analysis.macd?.histogram !== undefined && analysis.macd?.histogram !== null) ? analysis.macd.histogram.toFixed(2) : DEFAULT_NA_STRING} 
            colorClass={analysis.macd?.histogram > 0 ? 'change-positive-text' : (analysis.macd?.histogram < 0 ? 'change-negative-text' : '')} 
          />
        </div>
      </>
    );
  };

  return (
    <div className="indicator-section-card">
      <h4>Oscillators & Bands
        <span className="info-icon-container" aria-label="Oscillators & Bands Explanation" tabIndex={0}>
          <span className="info-icon" />
          <span className="tooltip-text">
            <p><strong>RSI (0-100):</strong> Indicates "overbought" (&gt;70, <span class='change-negative-text'>red</span>) or "oversold" (&lt;30, <span class='change-positive-text'>green</span>).</p>
            <p><strong>Bollinger Bands®:</strong> Volatility bands around a middle SMA. Price vs. middle: &gt; <span class='change-positive-text'>green</span>, &lt; <span class='change-negative-text'>red</span>.</p>
            <p><strong>MACD:</strong> EMA relationship. MACD above Signal: bullish. MACD below Signal: bearish. Histogram: divergence.</p>
          </span>
        </span>
      </h4>
      {renderTimeframeOscillators(dailyAnalysis, 'Daily')}
      {renderTimeframeOscillators(weeklyAnalysis, 'Weekly')}
      {renderTimeframeOscillators(monthlyAnalysis, 'Monthly')}
    </div>
  );
};

OscillatorsAndBandsSection.propTypes = {
  dailyAnalysis: PropTypes.object,
  weeklyAnalysis: PropTypes.object,
  monthlyAnalysis: PropTypes.object,
  DEFAULT_NA_STRING: PropTypes.string.isRequired,
};

OscillatorsAndBandsSection.defaultProps = {
  dailyAnalysis: null,
  weeklyAnalysis: null,
  monthlyAnalysis: null,
};

export default React.memo(OscillatorsAndBandsSection); 