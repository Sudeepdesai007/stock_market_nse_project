import React from 'react';
import PropTypes from 'prop-types';

// Constants moved from AnalysisTab.js
const SIGNAL_ERROR = 'Error in Analysis Data';
const SIGNAL_NOT_ENOUGH_DATA = 'Not Enough Data for Signal';
const SIGNAL_NEUTRAL_HOLD = 'Neutral / Hold';

// Helper function moved from AnalysisTab.js
const parseFactorReason = (reason) => {
  const match = reason.match(/^(.*)\s+\((.*)\)$/);
  if (match && match[1] && match[2]) {
    return { condition: match[1].trim(), implication: match[2].trim() };
  }
  return { condition: reason, implication: null };
};

// Helper function moved from AnalysisTab.js
const getSentimentStyleAndIcon = (signal) => {
  let sentimentClass = 'sentiment-neutral';
  let icon = '▬';
  if (signal) {
    if (signal.includes('Strongly Bullish') || signal.includes('Bullish')) {
      sentimentClass = 'sentiment-positive';
      icon = '▲';
    } else if (signal.includes('Strongly Bearish') || signal.includes('Bearish')) {
      sentimentClass = 'sentiment-negative';
      icon = '▼';
    } else if (signal === SIGNAL_NEUTRAL_HOLD) {
      sentimentClass = 'sentiment-neutral';
      icon = '▬';
    } else {
      sentimentClass = 'sentiment-muted';
      icon = 'ℹ️';
    }
  }
  return { sentimentClass, icon };
};

// Sub-component moved from AnalysisTab.js
const FactorDot = ({ reason }) => {
  const lowerReason = reason.toLowerCase();
  const isBullish = lowerReason.includes('bullish') || lowerReason.includes('oversold');
  const isBearish = lowerReason.includes('bearish') || lowerReason.includes('overbought');
  if (isBullish && !isBearish) {
    return <span className="bullish-factor-dot" title="Bullish factor"></span>;
  }
  if (isBearish && !isBullish) {
    return <span className="bearish-factor-dot" title="Bearish factor"></span>;
  }
  return <span className="neutral-factor-dot" title="Neutral factor"></span>;
};

FactorDot.propTypes = {
    reason: PropTypes.string.isRequired,
};

const TechnicalSignalDisplaySection = ({ technicalSignal, DEFAULT_NA_STRING }) => {
  if (!technicalSignal || !technicalSignal.signal) {
    return null;
  }

  const { sentimentClass, icon: sentimentIcon } = getSentimentStyleAndIcon(technicalSignal.signal);

  return (
    <div className="technical-signal-section card">
      <h4 className="technical-signal-heading">
        <span className="heading-text-with-icon">
          Overall Technical Sentiment
          <span className="info-icon-container" aria-label="Technical Sentiment Explanation" tabIndex={0}>
            <span className="info-icon" />
            <span className="tooltip-text">
              <p><strong>Overall Technical Sentiment:</strong> Summarized trend outlook (e.g., Bullish/Bearish) from multiple technical indicators.</p>
              <p><strong>Contribution Score:</strong> Balance of bullish vs. bearish signals. Higher bullish score suggests a more positive outlook.</p>
              
            </span>
          </span>
        </span>
        <span className={`sentiment-value ${sentimentClass}`}>
          <span className="sentiment-icon">{sentimentIcon}</span>
          {technicalSignal.signal}
        </span>
      </h4>
      {technicalSignal.scores && (technicalSignal.scores.bullish !== undefined || technicalSignal.scores.bearish !== undefined) && (technicalSignal.scores.bullish !== 0 || technicalSignal.scores.bearish !== 0) && (
        <div className="sentiment-scores-container">
          <span className="sentiment-score-label">Contribution Score:</span>
          <span className="bullish-score-value">Bullish: {typeof technicalSignal.scores.bullish === 'number' ? technicalSignal.scores.bullish.toFixed(1) : DEFAULT_NA_STRING}</span>
          <span className="sentiment-score-divider">|</span>
          <span className="bearish-score-value">Bearish: {typeof technicalSignal.scores.bearish === 'number' ? technicalSignal.scores.bearish.toFixed(1) : DEFAULT_NA_STRING}</span>
        </div>
      )}
      {technicalSignal.reasons && technicalSignal.reasons.length > 0 && technicalSignal.signal !== SIGNAL_ERROR && technicalSignal.signal !== SIGNAL_NOT_ENOUGH_DATA && (
        <>
          <h5 className="contributing-factors-heading">Contributing Factors:</h5>
          <ul className="contributing-factors-list">
            {technicalSignal.reasons.map((reasonStr, index) => {
              const { condition, implication } = parseFactorReason(reasonStr);
              let implicationClass = '';
              if (implication) {
                const lowerImplication = implication.toLowerCase();
                if (lowerImplication.includes('bullish') || lowerImplication.includes('positive') || lowerImplication.includes('oversold')) {
                  implicationClass = 'sentiment-positive-light';
                } else if (lowerImplication.includes('bearish') || lowerImplication.includes('negative') || lowerImplication.includes('overbought')) {
                  implicationClass = 'sentiment-negative-light';
                } else if (lowerImplication.includes('neutral')) {
                  implicationClass = 'sentiment-neutral-light';
                }
              }
              return (
                <li key={index} className="factor-item">
                  <FactorDot reason={reasonStr} />
                  <span className="factor-condition">{condition}</span>
                  {implication && (
                    <span className={`factor-implication ${implicationClass}`}>({implication})</span>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
      {(technicalSignal.signal === SIGNAL_ERROR || technicalSignal.signal === SIGNAL_NOT_ENOUGH_DATA) && technicalSignal.reasons && technicalSignal.reasons.length > 0 && (
        <p className="sentiment-status-message">{technicalSignal.reasons[0]}</p>
      )}
    </div>
  );
};

TechnicalSignalDisplaySection.propTypes = {
  technicalSignal: PropTypes.object,
  DEFAULT_NA_STRING: PropTypes.string.isRequired,
};

TechnicalSignalDisplaySection.defaultProps = {
  technicalSignal: null,
};

export default React.memo(TechnicalSignalDisplaySection); 