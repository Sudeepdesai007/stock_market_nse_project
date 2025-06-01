import { useState, useCallback } from 'react';
import { HISTORICAL_API_BASE_URL, PRIMARY_API_KEY, BACKUP_API_KEY } from '../constants';
import { fetchDataWithFallback } from '../utils/apiUtils';

/**
 * @file useHistoricalDataApi.js
 * @description Custom hook for fetching and managing historical stock data.
 * Encapsulates historical data state, loading/error states, period/filter selection,
 * and the API call logic with fallback for historical data.
 */
function useHistoricalDataApi(symbol, stockData, initialPeriod = '1yr', initialFilter = 'price') {
  const [historicalData, setHistoricalData] = useState(null);
  const [historicalLoading, setHistoricalLoading] = useState(false);
  const [historicalError, setHistoricalError] = useState(null);
  const [historicalPeriod, setHistoricalPeriod] = useState(initialPeriod);
  const [historicalFilter, setHistoricalFilter] = useState(initialFilter);

  const fetchHistoricalData = useCallback(async () => {
    if (!symbol || !symbol.trim() || !stockData) {
      setHistoricalData(null);
      setHistoricalLoading(false);
      return;
    }
    setHistoricalLoading(true);
    setHistoricalError(null);

    const currentQueryKey = `${symbol.toUpperCase()}-${historicalPeriod}-${historicalFilter}`;
    const url = `${HISTORICAL_API_BASE_URL}?stock_name=${symbol.toUpperCase()}&period=${historicalPeriod}&filter=${historicalFilter}`;

    try {
      const data = await fetchDataWithFallback(
        url,
        PRIMARY_API_KEY,
        BACKUP_API_KEY,
        'Primary (Historical Data)',
        'Backup (Historical Data)'
      );
      setHistoricalData({ data, queryKey: currentQueryKey });
    } catch (err) {
      setHistoricalError(err.message);
      setHistoricalData(null);
    }
    setHistoricalLoading(false);
  }, [symbol, stockData, historicalPeriod, historicalFilter]);

  return {
    historicalData,
    historicalLoading,
    historicalError,
    historicalPeriod,
    setHistoricalPeriod,
    historicalFilter,
    setHistoricalFilter,
    fetchHistoricalData,
    setHistoricalError,
    setHistoricalData
  };
}

export default useHistoricalDataApi; 