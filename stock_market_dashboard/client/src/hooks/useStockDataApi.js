import { useState, useCallback } from 'react';
import { transformStockDataApiResponse } from '../apiAdapter';
import { EXTERNAL_API_BASE_URL, PRIMARY_API_KEY, BACKUP_API_KEY } from '../constants';
import { fetchDataWithFallback } from '../utils/apiUtils';

/**
 * @file useStockDataApi.js
 * @description Custom hook to manage fetching and state for primary stock data.
 * Encapsulates symbol input, stock data, loading status, error handling,
 * and the API call logic including API key fallback.
 */
function useStockDataApi(initialSymbol = '') {
  const [symbol, setSymbol] = useState(initialSymbol);
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStockData = useCallback(async (currentSymbol) => {
    const symbolToFetch = (typeof currentSymbol === 'string' && currentSymbol.trim()) ? currentSymbol.trim() : symbol.trim();

    if (!symbolToFetch) {
      setError('Please enter a stock symbol or company name.');
      setStockData(null);
      setLoading(false); // Ensure loading is false if no symbol
      return;
    }

    setLoading(true);
    setError(null);
    setStockData(null); // Clear previous data

    const url = `${EXTERNAL_API_BASE_URL}?name=${symbolToFetch.toUpperCase()}`;

    try {
      const rawData = await fetchDataWithFallback(
        url,
        PRIMARY_API_KEY,
        BACKUP_API_KEY,
        'Primary (Stock Data)',
        'Backup (Stock Data)'
      );
      setStockData(transformStockDataApiResponse(rawData));
    } catch (err) {
      setError(err.message);
      setStockData(null);
    }
    setLoading(false);
  }, [symbol]);

  // Handler to update symbol and clear error
  const handleSymbolChange = useCallback((value) => {
    setSymbol(value);
    if (error) setError(null); // Clear previous error on new input
  }, [error]);

  return {
    symbol,
    stockData,
    loading,
    error,
    fetchStockData,
    handleSymbolChange,
    setError
  };
}

export default useStockDataApi; 