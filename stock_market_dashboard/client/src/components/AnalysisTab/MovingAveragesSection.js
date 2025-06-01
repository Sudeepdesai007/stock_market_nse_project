import React from 'react';
import PropTypes from 'prop-types';
import { MovingAverageItem } from './common'; // Assuming common items will be moved

const MovingAveragesSection = ({
  dailyAnalysis,
  weeklyAnalysis,
  monthlyAnalysis,
  formatCurrency,
  DEFAULT_NA_STRING,
}) => {
  if (!dailyAnalysis && !weeklyAnalysis && !monthlyAnalysis) {
    return null; // Or some placeholder if all are null
  }

  const hasDailyMAs = dailyAnalysis && (dailyAnalysis.smas || dailyAnalysis.emas);
  const hasWeeklyMAs = weeklyAnalysis && !weeklyAnalysis.error && (weeklyAnalysis.smas || weeklyAnalysis.emas);
  const hasMonthlyMAs = monthlyAnalysis && !monthlyAnalysis.error && (monthlyAnalysis.smas || monthlyAnalysis.emas);

  return (
    <div className="indicator-section-card">
      <h4>Moving Averages
        <span className="info-icon-container" aria-label="Moving Averages Explanation" tabIndex={0}>
          <span className="info-icon" />
          <span className="tooltip-text">
            <p><strong>Moving Averages (MAs):</strong> Smooth price data to reveal trends over set periods (e.g., 20, 50, 200 days).</p>
            <p><strong>SMA (Simple):</strong> Basic average of past prices.</p>
            <p><strong>EMA (Exponential):</strong> Weights recent prices more; reacts faster to changes.</p>
            <p>Price &gt; MA: <span class='change-positive-text'>positive (green)</span>; Price &lt; MA: <span class='change-negative-text'>negative (red)</span>.</p>
          </span>
        </span>
      </h4>

      {hasDailyMAs && (
        <>
          <h5 className="timeframe-subheader">Daily</h5>
          <div className="analysis-metric-grid">
            {dailyAnalysis.smas && Object.keys(dailyAnalysis.smas).map(key => (
              <MovingAverageItem key={`daily-sma-${key}`} label={key.replace('_', '-')} data={dailyAnalysis.smas[key]} formatCurrency={formatCurrency} DEFAULT_NA_STRING={DEFAULT_NA_STRING} />
            ))}
            {dailyAnalysis.emas && Object.keys(dailyAnalysis.emas).map(key => (
              <MovingAverageItem key={`daily-ema-${key}`} label={key.replace('_', '-')} data={dailyAnalysis.emas[key]} formatCurrency={formatCurrency} DEFAULT_NA_STRING={DEFAULT_NA_STRING} />
            ))}
          </div>
        </>
      )}

      {hasWeeklyMAs && (
        <>
          <h5 className="timeframe-subheader">Weekly</h5>
          <div className="analysis-metric-grid sub-grid">
            {weeklyAnalysis.smas && Object.keys(weeklyAnalysis.smas)
              .filter(key => !key.includes('SMA_200'))
              .map(key => (
              <MovingAverageItem key={`weekly-sma-${key}`} label={key.replace('_', '-')} data={weeklyAnalysis.smas[key]} formatCurrency={formatCurrency} DEFAULT_NA_STRING={DEFAULT_NA_STRING} />
            ))}
            {weeklyAnalysis.emas && Object.keys(weeklyAnalysis.emas)
              .filter(key => !key.includes('EMA_200'))
              .map(key => (
              <MovingAverageItem key={`weekly-ema-${key}`} label={key.replace('_', '-')} data={weeklyAnalysis.emas[key]} formatCurrency={formatCurrency} DEFAULT_NA_STRING={DEFAULT_NA_STRING} />
            ))}
          </div>
        </>
      )}
      {weeklyAnalysis?.error && <p className="timeframe-error-text">Weekly MA data not available: {weeklyAnalysis.error}</p>}
      
      {hasMonthlyMAs && (
        <>
          <h5 className="timeframe-subheader">Monthly</h5>
          <div className="analysis-metric-grid sub-grid">
            {monthlyAnalysis.smas && Object.keys(monthlyAnalysis.smas)
              .filter(key => !key.includes('SMA_20') && !key.includes('SMA_50') && !key.includes('SMA_200'))
              .map(key => (
              <MovingAverageItem key={`monthly-sma-${key}`} label={key.replace('_', '-')} data={monthlyAnalysis.smas[key]} formatCurrency={formatCurrency} DEFAULT_NA_STRING={DEFAULT_NA_STRING} />
            ))}
            {monthlyAnalysis.emas && Object.keys(monthlyAnalysis.emas)
              .filter(key => !key.includes('EMA_20') && !key.includes('EMA_50') && !key.includes('EMA_200'))
              .map(key => (
              <MovingAverageItem key={`monthly-ema-${key}`} label={key.replace('_', '-')} data={monthlyAnalysis.emas[key]} formatCurrency={formatCurrency} DEFAULT_NA_STRING={DEFAULT_NA_STRING} />
            ))}
          </div>
        </>
      )}
      {monthlyAnalysis?.error && <p className="timeframe-error-text">Monthly MA data not available: {monthlyAnalysis.error}</p>}
    </div>
  );
};

MovingAveragesSection.propTypes = {
  dailyAnalysis: PropTypes.object,
  weeklyAnalysis: PropTypes.object,
  monthlyAnalysis: PropTypes.object,
  formatCurrency: PropTypes.func.isRequired,
  DEFAULT_NA_STRING: PropTypes.string.isRequired,
};

MovingAveragesSection.defaultProps = {
  dailyAnalysis: null,
  weeklyAnalysis: null,
  monthlyAnalysis: null,
};

export default React.memo(MovingAveragesSection); 