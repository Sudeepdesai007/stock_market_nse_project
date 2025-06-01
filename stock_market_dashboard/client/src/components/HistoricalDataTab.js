import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  HISTORICAL_PERIODS, // Array of available historical periods (e.g., '1yr', '5yr')
  HISTORICAL_FILTERS  // Array of available historical filters (e.g., 'price', 'volume')
} from '../constants';
import './HistoricalDataTab/HistoricalDataTab.css';

/**
 * @file HistoricalDataTab.js
 * 
 * @description This component renders the "Historical Data" tab in the stock dashboard.
 * It allows users to select a time period (e.g., '1yr', '5yr') and a data filter/metric 
 * (e.g., 'price', 'volume', 'peRatio') to visualize historical stock performance.
 * The data is displayed using a line or bar chart, leveraging the Chart.js library 
 * (via react-chartjs-2). It handles loading states, error messages, and chart configurations.
 */

/**
 * Internal functional component for the Historical Data Tab.
 * Wrapped with React.memo for performance optimization.
 * @param {object} props - The component's props.
 * @param {string} props.historicalPeriod - The currently selected historical period (e.g., '1yr').
 * @param {function} props.setHistoricalPeriod - Callback function to update the selected historical period.
 * @param {string} props.historicalFilter - The currently selected metric/filter for historical data (e.g., 'price').
 * @param {function} props.setHistoricalFilter - Callback function to update the selected historical filter.
 * @param {boolean} props.historicalLoading - Boolean indicating if historical data is currently being fetched.
 * @param {string|null} props.historicalError - Error message string if fetching failed, otherwise null.
 * @param {object|null} props.historicalData - Object containing the fetched and formatted historical data for charting.
 * @param {string} props.symbol - The current stock symbol, used for cache keying of the chart.
 * @param {React.ComponentType} props.Line - The Line component constructor from 'react-chartjs-2', passed in for Chart.js rendering.
 * @param {string} props.tabId - The ID of the tab.
 * @param {function} props.onContentLoaded - Function to call when content is loaded.
 */
const HistoricalDataTabInternal = ({
  historicalPeriod,    
  setHistoricalPeriod, 
  historicalFilter,    
  setHistoricalFilter, 
  historicalLoading,   
  historicalError,     
  historicalData,      
  symbol,              
  Line,
  tabId,
  onContentLoaded
}) => {

  useEffect(() => {
    // Signal content loaded when data is available, or loading/error state is shown.
    // This covers cases where the chart is rendered, or a placeholder message is displayed.
    if (onContentLoaded) {
      if (historicalLoading) { // Loading
        onContentLoaded(tabId);
      } else if (historicalError) { // Error
        onContentLoaded(tabId);
      } else if (historicalData && historicalData.data && historicalData.data.datasets && historicalData.data.datasets.length > 0 && historicalData.data.datasets[0].values && historicalData.data.datasets[0].values.length > 0) { // Data available and chart will render
        onContentLoaded(tabId);
      } else if (historicalData && (!historicalData.data || !historicalData.data.datasets || historicalData.data.datasets.length === 0 || !historicalData.data.datasets[0].values || historicalData.data.datasets[0].values.length === 0)) { // Data object exists but is empty/malformed for chart (no data message will show)
        onContentLoaded(tabId);
      } else if (!historicalData && !historicalLoading && !historicalError) { // No data, not loading, no error (initial or specific no-data message)
        onContentLoaded(tabId);
      }
    }
  }, [historicalData, historicalLoading, historicalError, tabId, onContentLoaded]);

  return (
    <div 
      id="panel-historicalData" 
      role="tabpanel" 
      aria-labelledby="tab-historicalData" 
      className="tab-panel historical-data-tab-content card"
      // The `ref` for focus management and `tabIndex` are handled in App.js where this component is instantiated.
    >
      <h3>📜 Historical Performance Chart</h3>
      
      {/* Controls for selecting the time period and metric for the historical data chart */}
      <div className="historical-controls">
        {/* Period Selector Dropdown */}
        <div className="control-group">
          <label htmlFor="historicalPeriod">Period:</label>
          <select 
            id="historicalPeriod" 
            value={historicalPeriod} 
            onChange={(e) => setHistoricalPeriod(e.target.value)}
            disabled={historicalLoading} // Disable controls while data is loading
          >
            {/* Map over predefined historical periods from constants */}
            {HISTORICAL_PERIODS.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
          </select>
        </div>
        {/* Metric/Filter Selector Dropdown */}
        <div className="control-group">
          <label htmlFor="historicalFilter">Metric (Filter):</label>
          <select 
            id="historicalFilter" 
            value={historicalFilter} 
            onChange={(e) => setHistoricalFilter(e.target.value)}
            disabled={historicalLoading} // Disable controls while data is loading
          >
            {/* Map over predefined historical filters from constants */}
            {HISTORICAL_FILTERS.map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {/* Chart Area: Conditionally renders loading spinner, error message, the chart, or a no-data message */}
      {historicalLoading ? (
        // Loading State: Display spinner and message
        <div className="tab-content-spinner-container">
          <div className="spinner"></div>
          <p>Loading historical data...</p>
        </div>
      ) : historicalError ? (
        // Error State: Display error message
        <div className="analysis-status-message error"> 
          <h4>⚠️ Error Fetching Historical Data</h4>
          <p>{historicalError}</p>
        </div>
      // Data Available State: Check for valid data structure before rendering the chart
      ) : historicalData && historicalData.data && historicalData.data.datasets && historicalData.data.datasets.length > 0 && historicalData.data.datasets[0].values && historicalData.data.datasets[0].values.length > 0 ? (
        <div className="chart-container">
          <Line // The Line component from react-chartjs-2 (Chart.js wrapper)
            key={`${historicalPeriod}-${historicalFilter}-${symbol}`} // Force re-render if period, filter, or symbol changes, ensuring chart updates.
            data={{
              // Process datasets from historicalData for Chart.js format
              datasets: historicalData.data.datasets.map((dataset, index) => {
                const isVolume = (dataset.label && dataset.label.toLowerCase().includes('volume')) || (dataset.metric && dataset.metric.toLowerCase().includes('volume'));
                let commonProps = {
                  label: dataset.label || dataset.metric || `Dataset ${index + 1}`, // Fallback label
                  data: dataset.values.map(item => ({ x: item[0], y: parseFloat(item[1]) })), // Convert [timestamp, value] to {x, y}
                  tension: 0.1, // Slight curve for line charts
                };
                if (isVolume) {
                  // Volume data specific configuration: render as a bar chart on a secondary axis
                  return {
                    ...commonProps,
                    type: 'bar',          
                    yAxisID: 'y1',        // Link to the secondary Y-axis (y1)
                    backgroundColor: 'rgba(128, 128, 128, 0.5)', // Grey for volume bars
                    borderColor: 'rgba(128, 128, 128, 1)',
                  };
                } else { 
                  // Default configuration for price or other metrics: render as a line chart on the primary axis
                  let borderColor, backgroundColor;
                  if (index === 0) { // Primary dataset (e.g., Price)
                    borderColor = '#5865F2'; 
                    backgroundColor = 'rgba(88, 101, 242, 0.2)';
                  } else if (index === 1) { // Secondary dataset (if any)
                    borderColor = '#28a745'; 
                    backgroundColor = 'rgba(40, 167, 69, 0.2)';
                  } else { // Fallback for more datasets
                    borderColor = '#dc3545'; 
                    backgroundColor = 'rgba(220, 53, 69, 0.2)';
                  }
                  return {
                    ...commonProps,
                    type: 'line',
                    yAxisID: 'y',         // Link to the primary Y-axis (y)
                    borderColor: borderColor,
                    backgroundColor: backgroundColor,
                    fill: false,          // Lines will not be filled underneath
                  };
                }
              }),
            }}
            options={{
              responsive: true, // Chart adapts to container size
              maintainAspectRatio: false, // Allows chart to fill container height better
              interaction: {
                  mode: 'index',        // Tooltip shows all datasets at the hovered X-axis index
                  intersect: false,     // Tooltip appears even if not directly hovering over a data point
              },
              scales: {
                x: { // X-axis configuration (Time)
                  type: 'time', // Use time scale for X-axis
                  time: {
                    unit: 'day',         // Display data points by day
                    tooltipFormat: 'MMM dd, yyyy', // Date format in tooltips (e.g., Jan 01, 2023)
                    displayFormats: {
                      day: 'MMM dd'       // Date format on the X-axis ticks (e.g., Jan 01)
                    }
                  },
                  title: {
                    display: true,
                    text: 'Date',
                    color: '#DCDDDE'   // Themed text color
                  },
                  grid: {
                      color: '#4F545C', // Themed grid line color
                  },
                  ticks: {
                      color: '#DCDDDE', // Themed tick label color
                  }
                },
                y: { // Primary Y-axis configuration (e.g., for Price or primary metric)
                  type: 'linear',
                  display: true,
                  position: 'left',
                  title: {
                    display: true,
                    // Dynamically set Y-axis title based on the metric being displayed
                    text: historicalData.data.datasets[0]?.metric?.toLowerCase().includes('price') || historicalFilter.toLowerCase().includes('price') 
                          ? 'Price (₹)' 
                          : (historicalData.data.datasets[0]?.metric || historicalFilter.charAt(0).toUpperCase() + historicalFilter.slice(1)),
                    color: '#DCDDDE'
                  },
                  grid: {
                    color: '#4F545C',
                  },
                  ticks: {
                    color: '#DCDDDE',
                    // Custom callback to format Y-axis tick labels using Indian number format (e.g., 1,00,000)
                    callback: function(value) {
                      if (typeof value === 'number') {
                        return value.toLocaleString('en-IN');
                      }
                      return value;
                    }
                  }
                },
                y1: { // Secondary Y-axis configuration (typically for Volume)
                  type: 'linear',
                  display: true, // Only display if there's a dataset using this axis (Chart.js handles this implicitly)
                  position: 'right',
                  title: {
                    display: true,
                    text: 'Volume',
                    color: '#DCDDDE'
                  },
                  grid: {
                    drawOnChartArea: false, // Volume grid lines will not be drawn over the main chart area
                    color: '#4F545C',
                  },
                  ticks: {
                    color: '#DCDDDE',
                    // Custom callback to format volume ticks (e.g., 1.50 Cr, 25.00 L)
                    callback: function(value) {
                      if (typeof value === 'number') {
                        if (value >= 10000000) { // If value is in Crores
                          return (value / 10000000).toFixed(2) + ' Cr';
                        } else if (value >= 100000) { // If value is in Lakhs
                          return (value / 100000).toFixed(2) + ' L';
                        }
                        return value.toLocaleString('en-IN'); // Default to Indian number format
                      }
                      return value;
                    }
                  }
                }
              },
              plugins: {
                legend: {
                  position: 'top', // Display legend at the top of the chart
                  labels: {
                      color: '#DCDDDE' // Themed legend text color
                  }
                },
                tooltip: {
                  mode: 'index',
                  intersect: false,
                  // Custom tooltip label formatting for consistent number representation
                  callbacks: {
                      label: function(context) {
                          let label = context.dataset.label || '';
                          if (label) {
                              label += ': ';
                          }
                          if (context.parsed.y !== null) {
                              if (context.dataset.yAxisID === 'y1') { // Volume axis: format as Cr, L, or plain
                                  const val = parseFloat(context.parsed.y);
                                  if (val >= 10000000) label += (val / 10000000).toFixed(2) + ' Cr';
                                  else if (val >= 100000) label += (val / 100000).toFixed(2) + ' L';
                                  else label += val.toLocaleString('en-IN');
                              } else { // Primary axis (Price/Other): format with 2 decimal places and Indian locale
                                 label += parseFloat(context.parsed.y).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                              }
                          }
                          return label;
                      }
                  }
                }
              }
            }}
          />
        </div>
      /* Fallback Message: If data is not loading, no error, but data is missing or in unexpected format */
      ) : (
        <div className="analysis-status-message warning">
          <h4>📊 No Historical Data</h4>
          <p>No historical data available for the selected criteria, or data format is unexpected. Try adjusting period/filter or re-fetching.</p>
        </div>
      )}
    </div>
  );
};

// PropTypes for type checking and component documentation
HistoricalDataTabInternal.propTypes = {
  /** The currently selected historical period (e.g., '1yr') */
  historicalPeriod: PropTypes.string.isRequired,
  /** Callback function to update the selected historical period */
  setHistoricalPeriod: PropTypes.func.isRequired,
  /** The currently selected metric/filter for historical data (e.g., 'price') */
  historicalFilter: PropTypes.string.isRequired,
  /** Callback function to update the selected historical filter */
  setHistoricalFilter: PropTypes.func.isRequired,
  /** Boolean indicating if historical data is currently being fetched */
  historicalLoading: PropTypes.bool.isRequired,
  /** Error message string if fetching failed, otherwise null */
  historicalError: PropTypes.string, // Can be null
  /** Object containing the fetched and formatted historical data for charting */
  historicalData: PropTypes.object, // Can be null
  /** The current stock symbol, used for cache keying of the chart */
  symbol: PropTypes.string.isRequired,
  /** The Line component constructor from 'react-chartjs-2', passed in for Chart.js rendering */
  Line: PropTypes.elementType.isRequired,
  /** The ID of the tab */
  tabId: PropTypes.string.isRequired,
  /** Function to call when content is loaded */
  onContentLoaded: PropTypes.func.isRequired,
};

// Default props for the component
HistoricalDataTabInternal.defaultProps = {
  historicalError: null,  // Default to null if not provided
  historicalData: null,   // Default to null if not provided
  // Note: isRequired props like historicalPeriod, setHistoricalPeriod, etc., don't need defaults here as they are expected.
};

// Display name for React DevTools for easier debugging
HistoricalDataTabInternal.displayName = 'HistoricalDataTab';

// Memoize the HistoricalDataTab component using React.memo.
// This is crucial for performance as chart rendering can be expensive, and this prevents
// re-renders if the props (which include potentially large data objects) have not changed.
const HistoricalDataTab = React.memo(HistoricalDataTabInternal);

export default HistoricalDataTab; 