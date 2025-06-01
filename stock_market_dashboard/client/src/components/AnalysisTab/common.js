import React from 'react';
import PropTypes from 'prop-types';

// Copied from AnalysisTab.js
export const AnalysisMetricDisplayItem = ({ label, value, colorClass, unit }) => {
    return (
      <div className="analysis-metric-item">
        <strong className="analysis-metric-label-text">{label}:</strong>
        <span className={`analysis-metric-value-text ${colorClass || ''}`}>
          {value}
          {unit && value && value !== 'N/A' && <span className="unit"> {unit}</span>} 
        </span>
      </div>
    );
  };
  
AnalysisMetricDisplayItem.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    colorClass: PropTypes.string,
    unit: PropTypes.string,
};

AnalysisMetricDisplayItem.defaultProps = {
    value: 'N/A',
    colorClass: '',
    unit: '',
};
  
  // Copied from AnalysisTab.js
export const MovingAverageItem = ({ label, data, formatCurrency, DEFAULT_NA_STRING }) => {
    if (!data || data.value === null || data.value === undefined) return (
      <AnalysisMetricDisplayItem
        label={label}
        value={DEFAULT_NA_STRING}
        colorClass={data?.colorClass || ''}
      />
    ); 
    const displayValue = data.value !== DEFAULT_NA_STRING ? formatCurrency(data.value).value : DEFAULT_NA_STRING;
    return (
      <AnalysisMetricDisplayItem
        label={label}
        value={displayValue}
        colorClass={data.colorClass}
      />
    );
  };

MovingAverageItem.propTypes = {
    label: PropTypes.string.isRequired,
    data: PropTypes.shape({
        value: PropTypes.number,
        colorClass: PropTypes.string,
    }),
    formatCurrency: PropTypes.func.isRequired,
    DEFAULT_NA_STRING: PropTypes.string.isRequired,
};

MovingAverageItem.defaultProps = {
    data: { value: null, colorClass: '' },
}; 