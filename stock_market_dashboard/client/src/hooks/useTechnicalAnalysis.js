import { useState, useEffect, useCallback } from 'react';
import {
  DEFAULT_NA_STRING,
  getSafe,
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateBollingerBands,
  calculateMACDInternal,
  calculateRollingVWAPInternal,
  calculateVolumeSMAInternal,
  calculateOBVInternal,
  resampleToWeeklyInternal,
  resampleToMonthlyInternal
} from '../utils'; // Assuming utils are in a direct parent folder

// Constants for Technical Analysis
const SMA_PERIODS = [20, 50, 200];
const EMA_PERIODS = [20, 50, 200];
const RSI_PERIOD = 14;
const RSI_OVERSOLD_THRESHOLD = 30;
const RSI_OVERBOUGHT_THRESHOLD = 70;
const BOLLINGER_PERIOD = 20;
const BOLLINGER_STD_DEV = 2;

// Constants for Signal Generation Weights/Scores
// const MA_SHORT_TERM_SCORE = 1; // Not currently used
// const MA_LONG_TERM_SCORE = 2; // Not currently used
// const MA_LONG_TERM_PERIOD_THRESHOLD = 200; // Not currently used
// const RSI_SIGNAL_SCORE = 2; // Not currently used
// const MA_CROSSOVER_SHORT_SCORE = 1; // Not currently used
// const MA_CROSSOVER_MID_SCORE = 2; // Not currently used

// Constants for new indicators if any specific periods are needed globally
const MACD_FAST_PERIOD = 12;
const MACD_SLOW_PERIOD = 26;
const MACD_SIGNAL_PERIOD = 9;
const VWAP_PERIOD = 20;
const VOLUME_SMA_PERIOD = 20;

/**
 * @file useTechnicalAnalysis.js
 * @description Custom hook for calculating technical analysis data and signals.
 * Encapsulates logic for SMAs, EMAs, RSI, Bollinger Bands, and a technical sentiment signal.
 */
function useTechnicalAnalysis(historicalData, stockData, activeTab, historicalErrorFromApi, historicalFilter) {
  const [analysisData, setAnalysisData] = useState(null);
  const [technicalSignal, setTechnicalSignal] = useState(null);
  // analysisLoading could be true if historical data is loading OR if calculations are intensive.
  // For now, let's assume it mirrors historicalLoading when price data is expected.
  const [analysisLoading, setAnalysisLoading] = useState(false); 

  // Memoized utility functions to be used internally
  const memoizedGetSafe = useCallback(getSafe, []);
  const memoizedCalculateSMA = useCallback(calculateSMA, []);
  const memoizedCalculateEMA = useCallback(calculateEMA, []);
  const memoizedCalculateRSI = useCallback(calculateRSI, []);
  const memoizedCalculateBollingerBands = useCallback(calculateBollingerBands, []);
  const memoizedCalculateMACD = useCallback(calculateMACDInternal, []);
  const memoizedCalculateRollingVWAP = useCallback(calculateRollingVWAPInternal, []);
  const memoizedCalculateVolumeSMA = useCallback(calculateVolumeSMAInternal, []);
  const memoizedCalculateOBV = useCallback(calculateOBVInternal, []);
  const memoizedResampleToWeekly = useCallback(resampleToWeeklyInternal, []);
  const memoizedResampleToMonthly = useCallback(resampleToMonthlyInternal, []);

  // Helper function to calculate all indicators for a given dataset
  const calculateIndicatorsForPeriod = useCallback((prices, volumes, currentPrice, periodType) => {
    if (!prices || prices.length === 0) {
      return { error: `No price data for ${periodType}` };
    }

    const indicators = {
      smas: {},
      emas: {},
      rsi: null,
      bollingerBands: null,
      macd: null,
      vwap: null,
      volumeSMA: null,
      obv: null,
    };

    SMA_PERIODS.forEach(period => {
      if (prices.length >= period) {
        const smaResult = memoizedCalculateSMA(prices, period);
        const latestSMA = smaResult.length > 0 ? smaResult[smaResult.length - 1] : null;
        indicators.smas[`SMA_${period}`] = {
          value: latestSMA,
          colorClass: currentPrice !== null && latestSMA !== null ? (currentPrice > latestSMA ? 'change-positive-text' : 'change-negative-text') : ''
        };
      } else {
        indicators.smas[`SMA_${period}`] = { value: null, colorClass: '' };
      }
    });

    EMA_PERIODS.forEach(period => {
      if (prices.length >= period) {
        const emaResult = memoizedCalculateEMA(prices, period);
        const latestEMA = emaResult.length > 0 ? emaResult[emaResult.length - 1] : null;
        indicators.emas[`EMA_${period}`] = {
          value: latestEMA,
          colorClass: currentPrice !== null && latestEMA !== null ? (currentPrice > latestEMA ? 'change-positive-text' : 'change-negative-text') : ''
        };
      } else {
        indicators.emas[`EMA_${period}`] = { value: null, colorClass: '' };
      }
    });

    if (prices.length >= (RSI_PERIOD + 1)) {
      const rsiResult = memoizedCalculateRSI(prices, RSI_PERIOD);
      if (rsiResult.length > 0) {
        const latestRSI = rsiResult[rsiResult.length - 1];
        let rsiColor = '';
        if (latestRSI > RSI_OVERBOUGHT_THRESHOLD) rsiColor = 'change-negative-text';
        else if (latestRSI < RSI_OVERSOLD_THRESHOLD) rsiColor = 'change-positive-text';
        indicators.rsi = { value: parseFloat(latestRSI).toFixed(2), colorClass: rsiColor, fullSeries: rsiResult };
      }
    }

    if (prices.length >= BOLLINGER_PERIOD) {
      const bbResult = memoizedCalculateBollingerBands(prices, BOLLINGER_PERIOD, BOLLINGER_STD_DEV);
      if (bbResult && bbResult.upper.length > 0) {
        indicators.bollingerBands = {
          upper: parseFloat(bbResult.upper[bbResult.upper.length - 1]).toFixed(2),
          middle: { 
            value: parseFloat(bbResult.middle[bbResult.middle.length - 1]).toFixed(2), 
            colorClass: currentPrice !== null && bbResult.middle[bbResult.middle.length - 1] !== null ? (currentPrice > bbResult.middle[bbResult.middle.length - 1] ? 'change-positive-text' : 'change-negative-text') : ''
          },
          lower: parseFloat(bbResult.lower[bbResult.lower.length - 1]).toFixed(2),
          fullSeries: bbResult
        };
      }
    }
    
    // MACD
    const macdResult = memoizedCalculateMACD(prices, MACD_FAST_PERIOD, MACD_SLOW_PERIOD, MACD_SIGNAL_PERIOD);
    if (macdResult.macdLine.length > 0) {
        indicators.macd = {
            macd: macdResult.macdLine[macdResult.macdLine.length -1],
            signal: macdResult.signalLine[macdResult.signalLine.length -1],
            histogram: macdResult.histogram[macdResult.histogram.length -1],
            fullSeries: macdResult
        };
    }

    // Volume-based indicators (only if volume data is available)
    if (volumes && volumes.length === prices.length) {
        // Rolling VWAP
        if (prices.length >= VWAP_PERIOD) {
            const vwapResult = memoizedCalculateRollingVWAP(prices, volumes, VWAP_PERIOD);
            indicators.vwap = vwapResult.length > 0 ? vwapResult[vwapResult.length -1] : null;
        }

        // Volume SMA
        if (volumes.length >= VOLUME_SMA_PERIOD) {
            const volSMAResult = memoizedCalculateVolumeSMA(volumes, VOLUME_SMA_PERIOD);
            indicators.volumeSMA = volSMAResult.length > 0 ? volSMAResult[volSMAResult.length -1] : null;
        }

        // OBV
        const obvResult = memoizedCalculateOBV(prices, volumes);
        indicators.obv = obvResult.length > 0 ? obvResult[obvResult.length -1] : null;
        indicators.obvFullSeries = obvResult; // Keep full series for trend analysis
    }

    return indicators;
  }, [memoizedCalculateSMA, memoizedCalculateEMA, memoizedCalculateRSI, memoizedCalculateBollingerBands, memoizedCalculateMACD, memoizedCalculateRollingVWAP, memoizedCalculateVolumeSMA, memoizedCalculateOBV]); // Add other memoized funcs used inside

  useEffect(() => {
    const trimmedActiveTab = typeof activeTab === 'string' ? activeTab.trim() : activeTab;
    if (trimmedActiveTab !== 'analysis') {
      // If not on analysis tab, consider clearing or not processing.
      // For now, let's not clear, data might be useful if user switches back quickly.
      // setAnalysisData(null); 
      // setTechnicalSignal(null);
      return;
    }

    if (historicalErrorFromApi) {
      setAnalysisData({ daily: {error: `Failed to load historical data: ${historicalErrorFromApi}`}, weekly:{}, monthly:{} });
      setTechnicalSignal(null);
      setAnalysisLoading(false);
      return;
    }

    if (!stockData) {
      setAnalysisData({ daily: {error: "Stock data not available."}, weekly:{}, monthly:{} });
      setTechnicalSignal(null);
      setAnalysisLoading(false);
      return;
    }
    
    let isPriceData = false;
    if (historicalData && historicalData.data && historicalData.data.datasets && historicalData.data.datasets.length > 0) {
        const firstDataset = historicalData.data.datasets[0];
        const metric = firstDataset.metric;
        const metricLowerCase = typeof metric === 'string' ? metric.toLowerCase() : metric;
        isPriceData = metricLowerCase === 'price' || metricLowerCase === 'default' || !metric;
    } else if (!historicalData) {
        // Handled by the loading state or error state from API hook
    }

    if (!historicalData || !historicalData.data || !isPriceData) {
      setAnalysisLoading(true); // Explicitly set loading if we are waiting for price data
      setAnalysisData({ 
        daily: {error: "Loading historical price and volume data..."}, 
        weekly: {error: "Waiting for daily data..."}, 
        monthly: {error: "Waiting for daily data..."} 
      });
      setTechnicalSignal(null);
      // No need to call setHistoricalFilter('price') here, App.js useEffect for historicalData fetching handles it.
      return;
    }

    setAnalysisLoading(true);

    try {
      const priceDataset = historicalData.data.datasets[0];
      const volumeDataset = historicalData.data.datasets.find(ds => ds.metric?.toLowerCase() === 'volume');

      if (!priceDataset || !priceDataset.values) {
        throw new Error("Price data is missing or invalid.");
      }

      const combinedDailyData = [];
      const rawPriceValues = priceDataset.values; // [[timestamp, priceStr], ...]
      const rawVolumeValuesByTs = new Map(volumeDataset?.values?.map(item => [item[0], item[1]]) || []);

      for (const priceItem of rawPriceValues) {
        const timestamp = priceItem[0];
        const price = parseFloat(priceItem[1]);
        const rawVolume = rawVolumeValuesByTs.get(timestamp);
        const volume = rawVolume !== undefined ? parseFloat(rawVolume) : NaN; 

        if (!isNaN(price) && !isNaN(volume)) {
          combinedDailyData.push({ timestamp, price, volume });
        }
      }

      if (combinedDailyData.length === 0) {
        throw new Error("No valid combined daily price and volume data points found after cleaning.");
      }
      
      const dailyClosingPrices = combinedDailyData.map(d => d.price);
      const dailyVolumesForIndicators = combinedDailyData.map(d => d.volume);
      const dailyPricesWithTimestampsForResampling = combinedDailyData.map(d => [d.timestamp, d.price]);
      
      const nsePriceForAnalysis = memoizedGetSafe(() => stockData.currentPrice.nse, DEFAULT_NA_STRING);
      const bsePriceForAnalysis = memoizedGetSafe(() => stockData.currentPrice.bse, DEFAULT_NA_STRING);
      const dayHighForAnalysis = memoizedGetSafe(() => stockData.currentPrice.dayHigh, DEFAULT_NA_STRING);
      
      let currentStockPriceForAnalysisNum = null;
      if (nsePriceForAnalysis !== DEFAULT_NA_STRING) currentStockPriceForAnalysisNum = parseFloat(nsePriceForAnalysis);
      else if (bsePriceForAnalysis !== DEFAULT_NA_STRING) currentStockPriceForAnalysisNum = parseFloat(bsePriceForAnalysis);
      else if (dayHighForAnalysis !== DEFAULT_NA_STRING) currentStockPriceForAnalysisNum = parseFloat(dayHighForAnalysis);
      currentStockPriceForAnalysisNum = isNaN(currentStockPriceForAnalysisNum) ? null : currentStockPriceForAnalysisNum;

      const dailyIndicators = calculateIndicatorsForPeriod(dailyClosingPrices, dailyVolumesForIndicators, currentStockPriceForAnalysisNum, 'Daily');
      dailyIndicators.currentPriceForAnalysis = currentStockPriceForAnalysisNum;

      // Weekly Data
      const { weeklyPrices, weeklyVolumes } = memoizedResampleToWeekly(dailyPricesWithTimestampsForResampling, dailyVolumesForIndicators);
      const weeklyIndicators = calculateIndicatorsForPeriod(weeklyPrices, weeklyVolumes, currentStockPriceForAnalysisNum, 'Weekly');

      // Monthly Data
      const { monthlyPrices, monthlyVolumes } = memoizedResampleToMonthly(dailyPricesWithTimestampsForResampling, dailyVolumesForIndicators);
      const monthlyIndicators = calculateIndicatorsForPeriod(monthlyPrices, monthlyVolumes, currentStockPriceForAnalysisNum, 'Monthly');
      
      setAnalysisData({
        daily: dailyIndicators,
        weekly: weeklyIndicators,
        monthly: monthlyIndicators,
        error: null
      });

    } catch (e) {
      console.error("[useTechnicalAnalysis] Error DURING ANALYSIS CALCULATION:", e);
      setAnalysisData({ 
        daily: {error: `Error during daily analysis: ${e.message}`}, 
        weekly: {error: "Daily analysis failed"}, 
        monthly: {error: "Daily analysis failed"},
        error: `Overall analysis error: ${e.message}`
      });
    }
    setAnalysisLoading(false);

  }, [activeTab, historicalData, stockData, historicalErrorFromApi, historicalFilter, memoizedGetSafe, calculateIndicatorsForPeriod, memoizedResampleToWeekly, memoizedResampleToMonthly]);

  // useEffect for Technical Signal (dependent on analysisData)
  useEffect(() => {
    if (activeTab !== 'analysis' || !analysisData || analysisData.error) {
      setTechnicalSignal({ signal: analysisData?.error || 'Signal Pending...', scores: { bullish: 0, bearish: 0 }, reasons: [analysisData?.error || 'Waiting for data...'] });
      return;
    }
    if (analysisData.daily?.error) {
        setTechnicalSignal({ signal: 'Analysis Error', scores: { bullish: 0, bearish: 0 }, reasons: [analysisData.daily.error] });
        return;
    }
    if (!analysisData.daily?.currentPriceForAnalysis) {
        setTechnicalSignal({ signal: 'Signal Pending...', scores: { bullish: 0, bearish: 0 }, reasons: ['Current price not available for signal generation.'] });
        return;
    }

    let totalBullishScore = 0;
    let totalBearishScore = 0;
    const signalReasons = [];

    const timeframes = [
      { name: 'Daily', data: analysisData.daily, weight: 1 },
      { name: 'Weekly', data: analysisData.weekly, weight: 1.5 },
      { name: 'Monthly', data: analysisData.monthly, weight: 2 }
    ];

    const currentPrice = analysisData.daily.currentPriceForAnalysis; // Use daily current price for all comparisons for consistency

    timeframes.forEach(tf => {
      if (!tf.data || tf.data.error || !currentPrice) return; // Skip if no data, error, or no current price

      const { 
        smas, 
        emas, 
        rsi, 
        // bollingerBands, // Not directly used in current scoring logic
        macd, 
        vwap, 
        // volumeSMA, // Not directly used in current scoring logic
        // obv, // Latest OBV value, not directly used in current scoring (trend via obvFullSeries is used)
        obvFullSeries 
      } = tf.data;
      const tfName = tf.name;
      const tfWeight = tf.weight;

      // 1. Price vs SMAs
      SMA_PERIODS.forEach(p => {
        if (smas && smas[`SMA_${p}`]?.value !== null) {
          if (currentPrice > smas[`SMA_${p}`].value) {
            totalBullishScore += 1 * tfWeight;
            signalReasons.push(`${tfName}: Price > SMA ${p}`);
          } else {
            totalBearishScore += 1 * tfWeight;
            signalReasons.push(`${tfName}: Price < SMA ${p}`);
          }
        }
      });

      // 2. Price vs EMAs
      EMA_PERIODS.forEach(p => {
        if (emas && emas[`EMA_${p}`]?.value !== null) {
          if (currentPrice > emas[`EMA_${p}`].value) {
            totalBullishScore += 1 * tfWeight;
            signalReasons.push(`${tfName}: Price > EMA ${p}`);
          } else {
            totalBearishScore += 1 * tfWeight;
            signalReasons.push(`${tfName}: Price < EMA ${p}`);
          }
        }
      });
      
      // 3. MACD Signal
      if (macd && macd.macd !== null && macd.signal !== null) {
        if (macd.macd > macd.signal) {
          totalBullishScore += 2 * tfWeight; // MACD crossover often a stronger signal
          signalReasons.push(`${tfName}: MACD Line above Signal Line`);
        }
        if (macd.macd < macd.signal) { // Allow both, could be transitioning
          totalBearishScore += 2 * tfWeight;
          signalReasons.push(`${tfName}: MACD Line below Signal Line`);
        }
        if (macd.histogram !== null && macd.histogram > 0) {
            totalBullishScore += 0.5 * tfWeight;
            signalReasons.push(`${tfName}: MACD Histogram Positive`);
        }
        if (macd.histogram !== null && macd.histogram < 0) {
            totalBearishScore += 0.5 * tfWeight;
            signalReasons.push(`${tfName}: MACD Histogram Negative`);
        }
      }

      // 4. RSI
      if (rsi && rsi.value !== null) {
        const rsiVal = parseFloat(rsi.value);
        if (rsiVal < RSI_OVERSOLD_THRESHOLD) {
          totalBullishScore += 1.5 * tfWeight;
          signalReasons.push(`${tfName}: RSI < ${RSI_OVERSOLD_THRESHOLD} (Oversold)`);
        }
        if (rsiVal > RSI_OVERBOUGHT_THRESHOLD) {
          totalBearishScore += 1.5 * tfWeight;
          signalReasons.push(`${tfName}: RSI > ${RSI_OVERBOUGHT_THRESHOLD} (Overbought)`);
        }
      }
      
      // 5. Price vs VWAP
      if (vwap !== null) {
        if (currentPrice > vwap) {
          totalBullishScore += 1 * tfWeight;
          signalReasons.push(`${tfName}: Price > VWAP (${VWAP_PERIOD})`);
        }
        if (currentPrice < vwap) {
          totalBearishScore += 1 * tfWeight;
          signalReasons.push(`${tfName}: Price < VWAP (${VWAP_PERIOD})`);
        }
      }
      
      // 6. OBV Trend (simplified: check if latest OBV is > 20-period SMA of OBV)
      if (obvFullSeries && obvFullSeries.length > VOLUME_SMA_PERIOD) {
          const obvSma = memoizedCalculateSMA(obvFullSeries, VOLUME_SMA_PERIOD);
          const latestObv = obvFullSeries[obvFullSeries.length -1];
          const latestObvSma = obvSma[obvSma.length-1];
          if (latestObvSma !== null && latestObv > latestObvSma) {
              totalBullishScore += 1 * tfWeight;
              signalReasons.push(`${tfName}: OBV trending up (above its ${VOLUME_SMA_PERIOD}-period SMA)`);
          } else if (latestObvSma !== null && latestObv < latestObvSma) {
              totalBearishScore += 1 * tfWeight;
              signalReasons.push(`${tfName}: OBV trending down (below its ${VOLUME_SMA_PERIOD}-period SMA)`);
          }
      }

      // Bollinger Bands are more for volatility and overbought/sold in context, a bit more complex for direct scoring here without more rules.
      // For now, not adding to direct score, but data is available for display.

      // Volume SMA compared to current volume - also contextual, confirms moves. Not adding to score directly yet.
    });

    let finalSignal = 'Neutral';
    if (totalBullishScore > totalBearishScore * 1.1) { // Add a small threshold to be clearly bullish
      finalSignal = 'Bullish';
    } else if (totalBearishScore > totalBullishScore * 1.1) { // Add a small threshold
      finalSignal = 'Bearish';
    }
    if (signalReasons.length === 0 && totalBullishScore === 0 && totalBearishScore === 0) {
      finalSignal = 'Not Enough Data for Signal';
    }

    setTechnicalSignal({
      signal: finalSignal,
      scores: { bullish: parseFloat(totalBullishScore.toFixed(1)), bearish: parseFloat(totalBearishScore.toFixed(1)) },
      reasons: signalReasons.length > 0 ? signalReasons.slice(0, 15) : ['No strong directional signals based on current rules.'] // Limit reasons displayed
    });

  }, [analysisData, activeTab, memoizedCalculateSMA]); // memoizedCalculateSMA for OBV SMA

  return { analysisData, technicalSignal, analysisLoading };
}

export default useTechnicalAnalysis; 