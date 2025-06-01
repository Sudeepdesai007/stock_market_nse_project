// utils.js
// This file provides a collection of utility functions and constants used across the
// client-side application. It includes:
// - Default values and constants (e.g., NA string, financial statement keys).
// - Safe data accessors and parsers.
// - Data formatting functions (e.g., for currency, percentages, ratios).
// - Financial calculation functions (e.g., YoY growth, CAGR, metric calculations).
// - Technical indicator calculation functions (e.g., SMA, EMA, RSI, Bollinger Bands).
// - Helper functions for processing and extracting specific data pieces from API responses.
// The functions are designed to be robust, handling potential errors and missing data gracefully.

// Default string for N/A (Not Available) values
export const DEFAULT_NA_STRING = 'N/A';

// ================================================================================================
// FINANCIAL DATA KEYS (CONSTANTS)
// These constants represent the keys used to access specific financial items
// from the transformed API response (structured by apiAdapter.js).
// Using constants helps avoid typos and improves maintainability.
// ================================================================================================

// Financial Statement Type Identifiers
export const STMT_INC = 'INC'; // Income Statement
export const STMT_BAL = 'BAL'; // Balance Sheet
export const STMT_CAS = 'CAS'; // Cash Flow Statement

// --- Income Statement Keys ---
export const FIN_KEY_REVENUE = 'Revenue';
export const FIN_KEY_NET_INCOME = 'NetIncome';
export const FIN_KEY_OPERATING_INCOME = 'OperatingIncome';
export const FIN_KEY_GROSS_PROFIT = 'GrossProfit';
export const FIN_KEY_DEPRECIATION_AMORTIZATION_INC = 'Depreciation/Amortization';
export const FIN_KEY_UNUSUAL_EXPENSE_INCOME = 'UnusualExpense(Income)';
export const FIN_KEY_OTHER_NET_INCOME = 'OtherNet';
export const FIN_KEY_MINORITY_INTEREST_INC = 'MinorityInterest';
export const FIN_KEY_DILUTED_EPS_EXCL_EXTRA_ORD = 'DilutedEPSExcludingExtraOrdItems';
export const FIN_KEY_DPS_COMMON_STOCK = 'DPS-CommonStockPrimaryIssue';
export const FIN_KEY_DILUTED_WEIGHTED_AVG_SHARES = 'DilutedWeightedAverageShares';
export const FIN_KEY_INTEREST_INC_EXP_NET_NON_OP = 'InterestInc(Exp)Net-Non-OpTotal';

// --- Balance Sheet Keys ---
export const FIN_KEY_GOODWILL_NET = 'GoodwillNet';
export const FIN_KEY_INTANGIBLES_NET = 'IntangiblesNet';
export const FIN_KEY_TOTAL_DEBT = 'TotalDebt';
export const FIN_KEY_TOTAL_EQUITY = 'TotalEquity';
export const FIN_KEY_TANGIBLE_BOOK_VALUE_PER_SHARE = 'TangibleBookValueperShareCommonEq';
export const FIN_KEY_TOTAL_ASSETS = 'TotalAssets';
export const FIN_KEY_TOTAL_COMMON_SHARES_OUTSTANDING = 'TotalCommonSharesOutstanding';
export const FIN_KEY_LONG_TERM_INVESTMENTS = 'LongTermInvestments';
export const FIN_KEY_ACCRUED_EXPENSES = 'AccruedExpenses';
export const FIN_KEY_OTHER_CURRENT_LIABILITIES = 'OtherCurrentliabilitiesTotal';
export const FIN_KEY_OTHER_NON_CURRENT_LIABILITIES = 'OtherLiabilitiesTotal';
export const FIN_KEY_TOTAL_INVENTORY = 'TotalInventory';
export const FIN_KEY_CASH_AND_SHORT_TERM_INVESTMENTS = 'CashandShortTermInvestments';
export const FIN_KEY_TOTAL_CURRENT_ASSETS = 'TotalCurrentAssets';
export const FIN_KEY_TOTAL_CURRENT_LIABILITIES = 'TotalCurrentLiabilities';

// --- Cash Flow Statement Keys ---
export const FIN_KEY_CASH_FROM_OPERATING_ACTIVITIES = 'CashfromOperatingActivities';
export const FIN_KEY_CAPITAL_EXPENDITURES = 'CapitalExpenditures';
export const FIN_KEY_NET_CHANGE_IN_CASH = 'NetChangeinCash';
export const FIN_KEY_CHANGES_IN_WORKING_CAPITAL = 'ChangesinWorkingCapital';
export const FIN_KEY_NON_CASH_ITEMS_CAS = 'Non-CashItems';
export const FIN_KEY_ISSUANCE_RETIREMENT_DEBT_NET_CAS = 'Issuance(Retirement)ofDebtNet';
export const FIN_KEY_TOTAL_CASH_DIVIDENDS_PAID_CAS = 'TotalCashDividendsPaid';
export const FIN_KEY_FOREIGN_EXCHANGE_EFFECTS_CAS = 'ForeignExchangeEffects';
export const FIN_KEY_CASH_INTEREST_PAID_CAS = 'CashInterestPaid';
export const FIN_KEY_DEPRECIATION_AMORTIZATION_CAS = 'Depreciation/Amortization'; // Note: Same key as INC but for CAS
export const FIN_KEY_CASH_FROM_FINANCING_ACTIVITIES_CAS = 'CashfromFinancingActivities';

// ================================================================================================
// UTILITY FUNCTIONS
// ================================================================================================

/**
 * Safely retrieves a value from a nested object structure using a function.
 * @param {function} fn - A function that, when called, returns the desired value.
 * @param {*} [defaultValue=DEFAULT_NA_STRING] - The value to return if retrieval fails or value is null/undefined.
 * @returns {*} The retrieved value or the default value.
 */
export const getSafeInternal = (fn, defaultValue = DEFAULT_NA_STRING) => {
  try {
    const value = fn();
    // Check for undefined, null, or empty string
    if (value === undefined || value === null || value === '') {
      return defaultValue;
    }
    // Handle cases where API might return a single hyphen for N/A
    if (typeof value === 'string' && value.trim() === '-') {
      return defaultValue;
    }
    return value;
  } catch (e) {
    // Catch any errors during function execution (e.g., accessing property of undefined)
    return defaultValue;
  }
};

/**
 * Finds a specific financial data point from the yearly financial data.
 * @param {Array<Object>} yearlyFinancialData - Array of yearly financial objects (transformed by apiAdapter).
 * @param {number} yearIndex - The index of the year in the array (0 for current, 1 for previous, etc.).
 * @param {string} statementTypeConstant - The type of financial statement (STMT_INC, STMT_BAL, STMT_CAS).
 * @param {string} key - The specific financial item key (e.g., FIN_KEY_REVENUE).
 * @param {*} [defaultValue=DEFAULT_NA_STRING] - Value to return if the item is not found.
 * @returns {*} The financial data point or the default value.
 */
export const findFinancialByYearInternal = (yearlyFinancialData, yearIndex, statementTypeConstant, key, defaultValue = DEFAULT_NA_STRING) => {
  return getSafeInternal(() => {
    const yearData = yearlyFinancialData[yearIndex];
    if (!yearData) return defaultValue;

    let statementMap;
    if (statementTypeConstant === STMT_INC) {
      statementMap = yearData.incomeStatement;
    } else if (statementTypeConstant === STMT_BAL) {
      statementMap = yearData.balanceSheet;
    } else if (statementTypeConstant === STMT_CAS) {
      statementMap = yearData.cashFlowStatement;
    } else {
      // console.warn(`[findFinancialByYearInternal] Unknown statement type: ${statementTypeConstant}`);
      return defaultValue; // Unknown statement type
    }

    if (!statementMap || typeof statementMap[key] === 'undefined') {
        // console.warn(`[findFinancialByYearInternal] Key "${key}" not found in ${statementTypeConstant} for year index ${yearIndex}. Available keys: ${Object.keys(statementMap || {}).join(", ")}`);
        return defaultValue;
    }
    return statementMap[key];
  }, defaultValue);
};

/**
 * Formats a numeric value to a string representing crores.
 * @param {number|string} value - The numeric value to format.
 * @param {string} [defaultValue=DEFAULT_NA_STRING] - Value to return if formatting is not possible.
 * @returns {object} An object containing the formatted value string, unit ('Cr'), and raw numeric value.
 */
export const formatToCroresInternal = (value, defaultValue = DEFAULT_NA_STRING) => {
  const num = parseFloat(value);
  if (isNaN(num) || value === DEFAULT_NA_STRING) return { value: defaultValue, unit: '', raw: NaN };
  return { value: num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), unit: 'Cr', raw: num };
};

/**
 * Formats a numeric value to a percentage string.
 * @param {number|string} value - The numeric value to format.
 * @param {string} [defaultValue=DEFAULT_NA_STRING] - Value to return if formatting is not possible.
 * @param {object} [options={}] - Additional options, e.g., { colorOnPositiveNegative: true }.
 * @returns {object} An object with formatted value, unit ('%'), raw value, and optional colorClass.
 */
export const formatPercentageInternal = (value, defaultValue = DEFAULT_NA_STRING, options = {}) => {
  const num = parseFloat(value);
  if (isNaN(num) || value === DEFAULT_NA_STRING) return { value: defaultValue, unit: '', raw: NaN, colorClass: '' };
  let colorClass = '';
  if (options.colorOnPositiveNegative) {
    if (num > 0) colorClass = 'change-positive-text';
    else if (num < 0) colorClass = 'change-negative-text';
  }
  return { value: num.toFixed(2), unit: '%', raw: num, colorClass };
};

/**
 * Formats a numeric value to a ratio string (e.g., "2.50x").
 * @param {number|string} value - The numeric value to format.
 * @param {string} [defaultValue=DEFAULT_NA_STRING] - Value to return if formatting is not possible.
 * @returns {object} An object with formatted value, unit ('x'), and raw numeric value.
 */
export const formatRatioInternal = (value, defaultValue = DEFAULT_NA_STRING) => {
  const num = parseFloat(value);
  if (isNaN(num) || value === DEFAULT_NA_STRING) return { value: defaultValue, unit: '', raw: NaN };
  return { value: num.toFixed(2), unit: 'x', raw: num };
};

/**
 * Formats a numeric value to a currency string (Indian Rupees).
 * @param {number|string} value - The numeric value to format.
 * @param {string} [defaultValue=DEFAULT_NA_STRING] - Value to return if formatting is not possible.
 * @returns {object} An object with formatted value, unit ('₹'), raw value, and symbolPrefix flag.
 */
export const formatCurrencyInternal = (value, defaultValue = DEFAULT_NA_STRING) => {
  const num = parseFloat(value);
  if (isNaN(num) || value === DEFAULT_NA_STRING) return { value: defaultValue, unit: '', raw: NaN };
  return { value: num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), unit: '₹', raw: num, symbolPrefix: true };
};

/**
 * Calculates Year-over-Year (YoY) growth between two values.
 * @param {number|string} current - The current period's value.
 * @param {number|string} previous - The previous period's value.
 * @param {string} [defaultValue=DEFAULT_NA_STRING] - Value to return if calculation is not possible.
 * @returns {object} An object with formatted YoY growth, unit ('%'), raw growth, and colorClass.
 */
export const calculateYoYGrowthInternal = (current, previous, defaultValue = DEFAULT_NA_STRING) => {
  const currentNum = parseFloat(current);
  const previousNum = parseFloat(previous);
  if (isNaN(currentNum) || isNaN(previousNum) || previousNum === 0 || current === DEFAULT_NA_STRING || previous === DEFAULT_NA_STRING) {
    return { value: defaultValue, unit: '', raw: NaN, colorClass: '' };
  }
  const growth = ((currentNum - previousNum) / Math.abs(previousNum)) * 100;
  let colorClass = '';
  if (growth > 0) colorClass = 'change-positive-text';
  else if (growth < 0) colorClass = 'change-negative-text';
  return { value: growth.toFixed(2), unit: '%', raw: growth, colorClass };
};

/**
 * Calculates Compound Annual Growth Rate (CAGR).
 * @param {number|string} endValue - The ending value.
 * @param {number|string} startValue - The starting value.
 * @param {number} years - The number of years between start and end values.
 * @param {string} [defaultValue=DEFAULT_NA_STRING] - Value to return if calculation is not possible.
 * @returns {object} An object with formatted CAGR, unit ('%'), raw CAGR, and colorClass.
 */
export const calculateCAGRInternal = (endValue, startValue, years, defaultValue = DEFAULT_NA_STRING) => {
  const endVal = parseFloat(endValue);
  const startVal = parseFloat(startValue);
  if (isNaN(endVal) || isNaN(startVal) || startVal === 0 || years <= 0 || endValue === DEFAULT_NA_STRING || startValue === DEFAULT_NA_STRING) {
    return { value: defaultValue, unit: '', raw: NaN, colorClass: '' };
  }
  if (startVal <= 0 || endVal <= 0) {
    return { value: 'Not Meaningful', unit: '', raw: NaN, colorClass: '' };
  }
  const cagr = (Math.pow((endVal / startVal), (1 / years)) - 1) * 100;
  let colorClass = '';
  if (cagr > 0) colorClass = 'change-positive-text';
  else if (cagr < 0) colorClass = 'change-negative-text';
  return { value: cagr.toFixed(2), unit: '%', raw: cagr, colorClass };
};

/**
 * Extracts primary company data from a list of peer companies.
 * Tries to match based on NSE exchange code first, then by company name.
 * @param {object} stockJSON - The raw stock data object (pre-apiAdapter if it contains the peer list structure directly).
 * @param {function} getSafeFnRef - Reference to the getSafeInternal function.
 * @returns {object} The primary company's data object from the peer list, or an empty object if not found.
 */
export const getPrimaryCompanyDataFromPeerListInternal = (stockJSON, getSafeFnRef) => {
  const peers = getSafeFnRef(() => stockJSON.companyProfile.peerCompanyList, []);
  const nseCode = getSafeFnRef(() => stockJSON.companyProfile.exchangeCodeNse, '').toUpperCase();
  let companyData = peers.find(p => getSafeFnRef(() => p.tickerId, '').toUpperCase() === nseCode);
  if (companyData) return companyData;
  const currentCompanyName = getSafeFnRef(() => stockJSON.companyName, '').toLowerCase();
  if (currentCompanyName) {
    companyData = peers.find(p => getSafeFnRef(() => p.companyName, '').toLowerCase().includes(currentCompanyName.split(' ')[0]));
  }
  return companyData || {};
};

/**
 * Calculates the tenure (duration) based on a "since" date string.
 * @param {string} sinceDateStr - The date string (e.g., "DD/MM/YYYY" or other parsable formats).
 * @returns {string} A formatted tenure string (e.g., "X yrs, Y mos") or DEFAULT_NA_STRING.
 */
export const calculateTenureInternal = (sinceDateStr) => {
  if (!sinceDateStr || sinceDateStr === DEFAULT_NA_STRING) return DEFAULT_NA_STRING;
  
  let sinceDate;
  // Check for DD/MM/YYYY format
  const parts = sinceDateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (parts) {
    // parts[1] is day, parts[2] is month, parts[3] is year
    // JavaScript Date constructor expects month 0-11
    sinceDate = new Date(parseInt(parts[3], 10), parseInt(parts[2], 10) - 1, parseInt(parts[1], 10));
  } else {
    // Fallback to direct parsing if not in DD/MM/YYYY (e.g., YYYY-MM-DD or other standard formats)
    sinceDate = new Date(sinceDateStr);
  }

  if (isNaN(sinceDate.getTime())) return DEFAULT_NA_STRING;
  const today = new Date();
  let years = today.getFullYear() - sinceDate.getFullYear();
  let months = today.getMonth() - sinceDate.getMonth();
  if (months < 0 || (months === 0 && today.getDate() < sinceDate.getDate())) {
    years--;
    months += 12;
  }
  if (years < 0) return DEFAULT_NA_STRING;
  let tenureStr = '';
  if (years > 0) tenureStr += `${years} yr${years > 1 ? 's' : ''}`;
  if (months > 0) {
    if (tenureStr) tenureStr += ', ';
    tenureStr += `${months} mo${months > 1 ? 's' : ''}`;
  }
  return tenureStr || 'Current year';
};

/**
 * Calculates the average of a specific metric for a list of peer companies.
 * The result is then passed through the provided formatting function.
 * @param {Array<Object>} peerList - Array of peer company objects. Each object should have the specified `key`.
 * @param {string} key - The key of the metric to average (e.g., 'marketCap', 'priceToEarningsValueRatio').
 * @param {function} formatterFn - The formatting function (e.g., `formatToCroresInternal`, `formatRatioInternal`) to apply to the calculated average. It is also used for the default return if calculation is not possible.
 * @returns {object} The formatted average value, which is the output of `formatterFn(average)` or `formatterFn(DEFAULT_NA_STRING)`.
 */
// Remove getSafeInternal and DEFAULT_NA_STRING from params, use module-scoped versions
export const calculatePeerAverageInternal = (peerList, key, formatterFn) => {
  if (!peerList || peerList.length === 0) return formatterFn(DEFAULT_NA_STRING); // Use module-scoped DEFAULT_NA_STRING
  let sum = 0;
  let count = 0;
  peerList.forEach(peer => {
    const rawValue = getSafeInternal(() => peer[key], null); // Use module-scoped getSafeInternal
    const value = parseFloat(rawValue);
    if (rawValue !== null && !isNaN(value)) {
      sum += value;
      count++;
    }
  });
  return count > 0 ? formatterFn(sum / count) : formatterFn(DEFAULT_NA_STRING); // Use module-scoped DEFAULT_NA_STRING
};

/**
 * Generates details for comparing a company's metric against its peer average.
 * This includes a status (e.g., 'better', 'worse') and a descriptive text.
 * @param {number|string} companyRaw - The company's raw metric value.
 * @param {object} peerAvgObj - The peer average object, typically an output from a formatting function (e.g., `formatRatioInternal`). This object is expected to have a `.raw` property containing the numeric peer average and a `.value` property for the formatted string.
 * @param {string} metricName - The display name of the metric (e.g., "P/E Ratio", "RoE").
 * @param {boolean} [lowerIsBetter=false] - Set to true if a lower value is considered better for this metric (e.g., Debt/Equity).
 * @param {boolean} [isSizeComparison=false] - Set to true if comparing size metrics (e.g., Market Cap), which results in "Larger" or "Smaller" text instead of "better" or "worse".
 * @returns {object} An object with: 
 *                    `status`: A string indicating comparison result ('better', 'worse', 'higher', 'lower', 'neutral'). 
 *                    `text`: A descriptive string for UI display (e.g., "(Higher P/E Ratio vs Peers)").
 */
// Remove DEFAULT_NA_STRING from params, use module-scoped version
export const getPeerComparisonDetailsInternal = (companyRaw, peerAvgObj, metricName, lowerIsBetter = false, isSizeComparison = false) => {
  const companyVal = parseFloat(companyRaw);
  // peerAvgObj is expected to have a .raw property containing the numeric peer average
  const peerAvgVal = peerAvgObj && typeof peerAvgObj.raw !== 'undefined' ? peerAvgObj.raw : NaN;
  let comparison = { status: 'neutral', text: '' };

  if (companyRaw === DEFAULT_NA_STRING || (peerAvgObj && peerAvgObj.value === DEFAULT_NA_STRING) || isNaN(companyVal) || isNaN(peerAvgVal)) {
    return comparison;
  }

  if (isSizeComparison) {
    if (companyVal > peerAvgVal) {
      comparison = { status: 'higher', text: `(Larger ${metricName} vs Peers)` };
    } else if (companyVal < peerAvgVal) {
      comparison = { status: 'lower', text: `(Smaller ${metricName} vs Peers)` };
    }
  } else {
    if (companyVal <= 0 || peerAvgVal <= 0) {
      if (metricName === 'RoE' || metricName === 'Dividend Yield') {
        if (companyVal > peerAvgVal) comparison = { status: 'better', text: `(Higher ${metricName} vs Peers)` };
        else if (companyVal < peerAvgVal) comparison = { status: 'worse', text: `(Lower ${metricName} vs Peers)` };
      } else {
        return comparison;
      }
    } else {
      if (lowerIsBetter) {
        if (companyVal < peerAvgVal) comparison = { status: 'better', text: `(Lower ${metricName} vs Peers)` };
        else if (companyVal > peerAvgVal) comparison = { status: 'worse', text: `(Higher ${metricName} vs Peers)` };
      } else { 
        if (companyVal > peerAvgVal) comparison = { status: 'better', text: `(Higher ${metricName} vs Peers)` };
        else if (companyVal < peerAvgVal) comparison = { status: 'worse', text: `(Lower ${metricName} vs Peers)` };
      }
    }
  }
  return comparison;
};

// ================================================================================================
// TECHNICAL INDICATOR CALCULATIONS
// Functions for calculating common financial technical indicators like SMA, EMA, RSI, and Bollinger Bands.
// These typically operate on an array of numerical data (e.g., closing prices).
// ================================================================================================

/**
 * Calculates Simple Moving Average (SMA).
 * The SMA is the unweighted mean of the previous `period` data points.
 * @param {Array<number>} data - Array of numerical data (e.g., closing prices).
 * @param {number} period - The lookback period for the SMA calculation.
 * @returns {Array<number|null>} Array of SMA values. The length of this array will be `data.length - period + 1`.
 *                               Returns an empty array if `data` length is less than `period`.
 */
export const calculateSMAInternal = (data, period) => {
  if (!data || data.length < period) return [];
  const sma = [];
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0);
    sma.push(sum / period);
  }
  return sma;
};

/**
 * Calculates Exponential Moving Average (EMA).
 * The EMA gives more weight to recent prices.
 * The first EMA value is calculated as the SMA of the initial `period`.
 * @param {Array<number>} data - Array of numerical data (e.g., closing prices).
 * @param {number} period - The lookback period for the EMA calculation.
 * @returns {Array<number|null>} Array of EMA values. The length of this array will be `data.length - period + 1`.
 *                               Returns an empty array if `data` length is less than `period`.
 */
export const calculateEMAInternal = (data, period) => {
  if (!data || data.length < period) return [];
  const ema = [];
  const k = 2 / (period + 1);
  // First EMA is an SMA
  let currentEma = data.slice(0, period).reduce((acc, val) => acc + val, 0) / period;
  ema.push(currentEma); // Store the first EMA which corresponds to the 'period-1' index of original data

  for (let i = period; i < data.length; i++) {
    currentEma = (data[i] * k) + (currentEma * (1 - k));
    ema.push(currentEma);
  }
  return ema;
};

/**
 * Calculates Standard Deviation. Helper for Bollinger Bands.
 * @param {Array<number>} data - Array of data points.
 * @param {number} period - The period for standard deviation calculation.
 * @returns {Array<number|null>} Array of standard deviation values.
 */
export const calculateStandardDeviationInternal = (data, period) => {
  if (!data || data.length < period) return [];
  const stdDevs = [];
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const mean = slice.reduce((acc, val) => acc + val, 0) / period;
    const variance = slice.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / period;
    stdDevs.push(Math.sqrt(variance));
  }
  return stdDevs;
};

/**
 * Calculates Relative Strength Index (RSI).
 * @param {Array<number>} data - Array of price data.
 * @param {number} [period=14] - The period for RSI calculation.
 * @returns {Array<number|null>} Array of RSI values.
 */
export const calculateRSIInternal = (data, period = 14) => {
  if (!data || data.length < period + 1) return []; // Need at least period + 1 data points for the first change

  let gains = 0;
  let losses = 0;

  // Calculate initial average gains and losses
  for (let i = 1; i <= period; i++) {
    const change = data[i] - data[i - 1];
    if (change > 0) {
      gains += change;
    } else {
      losses += Math.abs(change);
    }
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;
  const rsiValues = [];
  
  for (let i = period + 1; i < data.length; i++) {
    const change = data[i] - data[i - 1];
    let currentGain = 0;
    let currentLoss = 0;

    if (change > 0) {
      currentGain = change;
    } else {
      currentLoss = Math.abs(change);
    }

    avgGain = (avgGain * (period - 1) + currentGain) / period;
    avgLoss = (avgLoss * (period - 1) + currentLoss) / period;
    
    const rs = avgLoss === 0 ? Infinity : avgGain / avgLoss; // Handle division by zero for avgLoss
    const rsi = 100 - (100 / (1 + rs));
    rsiValues.push(rsi);
  }
  return rsiValues; // Returns an array of RSI values, last one is the most current
};

/**
 * Calculates Bollinger Bands.
 * @param {Array<number>} data - Array of price data.
 * @param {number} [period=20] - The period for the middle band (SMA).
 * @param {number} [numStdDev=2] - The number of standard deviations for upper/lower bands.
 * @returns {object|null} An object with upper, middle, and lower band arrays, or null.
 */
export const calculateBollingerBandsInternal = (data, period = 20, numStdDev = 2) => {
  if (!data || data.length < period) return { upper: [], middle: [], lower: [] };
  const middleBand = calculateSMAInternal(data, period); // SMA is the middle band
  const stdDevs = calculateStandardDeviationInternal(data, period);
  const upperBand = [];
  const lowerBand = [];

  // Adjust loop to align with middleBand (SMA) length
  // SMA result is shorter by 'period - 1' than original data.
  // StdDev result is also shorter by 'period - 1'.
  // We need to ensure we only calculate BB for points where we have both SMA and StdDev.
  // The SMA and StdDev arrays are aligned with each other, starting from the (period-1)th index of original data.
  for (let i = 0; i < middleBand.length; i++) { 
    upperBand.push(middleBand[i] + (stdDevs[i] * numStdDev));
    lowerBand.push(middleBand[i] - (stdDevs[i] * numStdDev));
  }
  // The middleBand itself is already aligned if it came directly from calculateSMAInternal.
  // No, calculateSMAInternal returns an array whose first element corresponds to originalData[period-1].
  // So, if data has N elements, SMA output has N - period + 1 elements.
  // We need to return middleBand as is, as it's already calculated.
  return { upper: upperBand, middle: middleBand, lower: lowerBand };
};

/**
 * Calculates Moving Average Convergence Divergence (MACD).
 * @param {number[]} data - Array of closing prices.
 * @param {number} [fastPeriod=12] - The period for the fast EMA.
 * @param {number} [slowPeriod=26] - The period for the slow EMA.
 * @param {number} [signalPeriod=9] - The period for the signal line EMA.
 * @returns {object} An object with arrays: macdLine, signalLine, histogram.
 */
export const calculateMACDInternal = (data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) => {
  if (!data || data.length < slowPeriod + signalPeriod -1) { // Need enough data for slow EMA and then signal EMA
    // console.warn("[calculateMACDInternal] Not enough data points.");
    return { macdLine: [], signalLine: [], histogram: [] };
  }

  const fastEMA = calculateEMAInternal(data, fastPeriod);
  const slowEMA = calculateEMAInternal(data, slowPeriod);

  // Align EMAs: MACD calculation can only start when both EMAs are available.
  // The shorter EMA series will be longer. We need to trim the start of the shorter EMA series
  // so it aligns with the start of the longer EMA series.
  const macdLine = [];
  // const alignedFastEMA = fastEMA.slice(slowPeriod - fastPeriod); // This was unused
  // Or, more generally, find the starting point where both EMAs have values.
  // Since calculateEMAInternal pads with nulls or returns shorter array if not enough data,
  // we need to be careful. Assuming calculateEMA returns arrays of same length as input, padded with nulls at start if period not met.
  // Let's find the first index where both EMAs are non-null (or non-NaN)
  
  let firstValidIndex = 0;
  for(let i = 0; i < data.length; i++) {
    if (fastEMA[i] !== null && !isNaN(fastEMA[i]) && slowEMA[i] !== null && !isNaN(slowEMA[i])) {
      firstValidIndex = i;
      break;
    }
    if (i === data.length - 1) { // No valid common point found
        return { macdLine: [], signalLine: [], histogram: [] };
    }
  }

  for (let i = firstValidIndex; i < data.length; i++) {
    if (fastEMA[i] !== null && !isNaN(fastEMA[i]) && slowEMA[i] !== null && !isNaN(slowEMA[i])) {
      macdLine.push(fastEMA[i] - slowEMA[i]);
    } else {
      // If we have a gap after starting, push null. This case should ideally not happen if EMAs are calculated correctly up to data.length
      macdLine.push(null); 
    }
  }
  
  // Filter out initial nulls from macdLine before calculating signal line if any were pushed due to staggered EMA starts
  const validMacdLine = macdLine.filter(val => val !== null && !isNaN(val));
  if (validMacdLine.length < signalPeriod) {
    // console.warn("[calculateMACDInternal] Not enough MACD line data points for signal line.");
    return { macdLine: macdLine, signalLine: [], histogram: [] }; // Return full macdLine for context
  }

  const signalLineFull = calculateEMAInternal(validMacdLine, signalPeriod);
  const histogram = [];
  
  // Align signal line with the original macdLine length by padding at the start
  // The signalLine is calculated on validMacdLine, which might be shorter than the original data array span.
  // We need to align it back for the histogram calculation against the potentially padded macdLine.
  const signalLinePadding = macdLine.length - signalLineFull.length;
  const signalLine = Array(signalLinePadding).fill(null).concat(signalLineFull);

  for (let i = 0; i < macdLine.length; i++) {
    if (macdLine[i] !== null && !isNaN(macdLine[i]) && signalLine[i] !== null && !isNaN(signalLine[i])) {
      histogram.push(macdLine[i] - signalLine[i]);
    } else {
      histogram.push(null);
    }
  }

  return { macdLine, signalLine, histogram };
};

/**
 * Calculates a Rolling Volume Weighted Average Price (VWAP).
 * @param {number[]} prices - Array of closing prices.
 * @param {number[]} volumes - Array of corresponding volumes.
 * @param {number} period - The rolling period for VWAP calculation.
 * @returns {number[]} An array of VWAP values, with initial values as null if period not met.
 */
export const calculateRollingVWAPInternal = (prices, volumes, period) => {
  if (!prices || !volumes || prices.length !== volumes.length || prices.length < period) {
    // console.warn("[calculateRollingVWAPInternal] Invalid input data or not enough data points.");
    const result = new Array(prices ? prices.length : 0).fill(null);
    return result;
  }

  const vwapValues = new Array(prices.length).fill(null);

  for (let i = period - 1; i < prices.length; i++) {
    let sumPriceVolume = 0;
    let sumVolume = 0;
    for (let j = 0; j < period; j++) {
      const index = i - j;
      if (prices[index] !== null && !isNaN(prices[index]) && volumes[index] !== null && !isNaN(volumes[index])) {
        sumPriceVolume += prices[index] * volumes[index];
        sumVolume += volumes[index];
      }
    }
    if (sumVolume > 0) {
      vwapValues[i] = sumPriceVolume / sumVolume;
    } else {
      vwapValues[i] = null; // Avoid division by zero if all volumes in period are zero or null
    }
  }
  return vwapValues;
};

/**
 * Calculates a Simple Moving Average (SMA) for volume data.
 * @param {number[]} volumeData - Array of volume figures.
 * @param {number} period - The period over which to calculate the SMA.
 * @returns {number[]} An array of SMA values for volume, with initial values as null if period not met.
 */
export const calculateVolumeSMAInternal = (volumeData, period) => {
  if (!volumeData || volumeData.length < period) {
    // console.warn("[calculateVolumeSMAInternal] Not enough data points for period:", period);
    const result = new Array(volumeData ? volumeData.length : 0).fill(null);
    return result;
  }
  const smaValues = new Array(volumeData.length).fill(null);
  for (let i = period - 1; i < volumeData.length; i++) {
    let sum = 0;
    let count = 0;
    for (let j = 0; j < period; j++) {
      const vol = volumeData[i - j];
      if (vol !== null && !isNaN(vol)) {
        sum += vol;
        count++;
      }
    }
    if (count === period) { // Ensure full period of valid data for a meaningful average
        smaValues[i] = sum / period;
    } else {
        smaValues[i] = null; // Not enough valid data points in the window
    }
    
  }
  return smaValues;
};

/**
 * Calculates a basic On-Balance Volume (OBV).
 * @param {number[]} prices - Array of closing prices.
 * @param {number[]} volumes - Array of corresponding volumes.
 * @returns {number[]} An array of OBV values.
 */
export const calculateOBVInternal = (prices, volumes) => {
  if (!prices || !volumes || prices.length !== volumes.length || prices.length === 0) {
    // console.warn("[calculateOBVInternal] Invalid input data or empty arrays.");
    return [];
  }

  const obvValues = new Array(prices.length).fill(0);
  if (prices.length === 0) return [];

  // OBV typically starts at 0 or with the first day's volume depending on convention.
  // Let's start with 0 for the first value, meaning the first change dictates its direction.
  // Or, more commonly, the first day's OBV is simply that day's volume if price went up (from a hypothetical day 0) or -volume if down.
  // For simplicity in our context where we don't have a day 0, we can set obvValues[0] = volumes[0] or 0.
  // Let's assume first day OBV is 0, subsequent changes apply.
  // If prices[0] is valid, volumes[0] is used for the first step if we consider a change from an implicit prior day.
  // However, to be safe and standard, OBV needs a comparison. First OBV is 0.
  
  obvValues[0] = 0; // Or some prefer `volumes[0]` but trend is key.
  // Let's use the common approach: if data starts at index 0, obv[0] = 0.
  // obv[1] is then volumes[1] if prices[1]>prices[0], etc.
  // This means the first actual OBV value is at index 1.

  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > prices[i-1]) {
      obvValues[i] = obvValues[i-1] + volumes[i];
    } else if (prices[i] < prices[i-1]) {
      obvValues[i] = obvValues[i-1] - volumes[i];
    } else {
      obvValues[i] = obvValues[i-1];
    }
  }
  return obvValues;
};

/**
 * Resamples daily data (prices and volumes) to weekly data.
 * Assumes pricesAndTimestamps is an array of [timestamp, price] and volumes is an array of numbers.
 * @param {Array<Array<any>>} dailyPricesWithTimestamps - Array of [timestamp, price] arrays.
 * @param {number[]} dailyVolumes - Array of daily volumes, corresponding to dailyPricesWithTimestamps.
 * @returns {object} An object with { weeklyTimestamps, weeklyPrices, weeklyVolumes }.
 */
export const resampleToWeeklyInternal = (dailyPricesWithTimestamps, dailyVolumes) => {
  if (!dailyPricesWithTimestamps || !dailyVolumes || dailyPricesWithTimestamps.length !== dailyVolumes.length || dailyPricesWithTimestamps.length === 0) {
    return { weeklyTimestamps: [], weeklyPrices: [], weeklyVolumes: [] };
  }

  const weeklyTimestamps = [];
  const weeklyPrices = [];
  const weeklyVolumes = [];

  let currentWeekStartTime = null;
  let currentWeekClose = null;
  let currentWeekVolumeSum = 0;

  for (let i = 0; i < dailyPricesWithTimestamps.length; i++) {
    const [timestamp, price] = dailyPricesWithTimestamps[i];
    const volume = dailyVolumes[i];
    const date = new Date(timestamp); // Assumes timestamp is something Date constructor can parse

    if (currentWeekStartTime === null) {
      currentWeekStartTime = date;
      // Adjust to the start of the week (e.g., Sunday or Monday)
      // For simplicity, using day of the month and checking if new week started based on day difference
      // More robust would be to use getDay() and go back to Monday/Sunday
      const dayOfWeek = currentWeekStartTime.getDay(); // 0 for Sunday, 1 for Monday ...
      currentWeekStartTime.setDate(currentWeekStartTime.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // Adjust to Monday (or previous Monday if Sunday)
      currentWeekStartTime.setHours(0,0,0,0);
    }

    currentWeekClose = price;
    currentWeekVolumeSum += volume;

    // Check if next day is in a new week or if it's the last day
    const isLastDay = i === dailyPricesWithTimestamps.length - 1;
    let nextDayIsInNewWeek = false;
    if (!isLastDay) {
      const nextDate = new Date(dailyPricesWithTimestamps[i+1][0]);
      nextDate.setHours(0,0,0,0);
      if (nextDate.getTime() >= currentWeekStartTime.getTime() + 7 * 24 * 60 * 60 * 1000) {
        nextDayIsInNewWeek = true;
      }
    }

    if (isLastDay || nextDayIsInNewWeek) {
      weeklyTimestamps.push(new Date(currentWeekStartTime).getTime()); // Store start of week timestamp
      weeklyPrices.push(currentWeekClose);
      weeklyVolumes.push(currentWeekVolumeSum);
      
      currentWeekStartTime = null; // Reset for next week
      currentWeekVolumeSum = 0;
      currentWeekClose = null;
    }
  }
  return { weeklyTimestamps, weeklyPrices, weeklyVolumes };
};

/**
 * Resamples daily data (prices and volumes) to monthly data.
 * @param {Array<Array<any>>} dailyPricesWithTimestamps - Array of [timestamp, price] arrays.
 * @param {number[]} dailyVolumes - Array of daily volumes.
 * @returns {object} An object with { monthlyTimestamps, monthlyPrices, monthlyVolumes }.
 */
export const resampleToMonthlyInternal = (dailyPricesWithTimestamps, dailyVolumes) => {
  if (!dailyPricesWithTimestamps || !dailyVolumes || dailyPricesWithTimestamps.length !== dailyVolumes.length || dailyPricesWithTimestamps.length === 0) {
    return { monthlyTimestamps: [], monthlyPrices: [], monthlyVolumes: [] };
  }

  const monthlyTimestamps = [];
  const monthlyPrices = [];
  const monthlyVolumes = [];

  let currentMonthStartTime = null;
  let currentMonthClose = null;
  let currentMonthVolumeSum = 0;

  for (let i = 0; i < dailyPricesWithTimestamps.length; i++) {
    const [timestamp, price] = dailyPricesWithTimestamps[i];
    const volume = dailyVolumes[i];
    const date = new Date(timestamp);

    if (currentMonthStartTime === null) {
      currentMonthStartTime = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
    }

    currentMonthClose = price;
    currentMonthVolumeSum += volume;

    const isLastDay = i === dailyPricesWithTimestamps.length - 1;
    let nextDayIsInNewMonth = false;
    if (!isLastDay) {
      const nextDate = new Date(dailyPricesWithTimestamps[i+1][0]);
      if (nextDate.getFullYear() > currentMonthStartTime.getFullYear() || nextDate.getMonth() > currentMonthStartTime.getMonth()) {
        nextDayIsInNewMonth = true;
      }
    }

    if (isLastDay || nextDayIsInNewMonth) {
      monthlyTimestamps.push(new Date(currentMonthStartTime).getTime());
      monthlyPrices.push(currentMonthClose);
      monthlyVolumes.push(currentMonthVolumeSum);
      
      currentMonthStartTime = null;
      currentMonthVolumeSum = 0;
      currentMonthClose = null;
    }
  }
  return { monthlyTimestamps, monthlyPrices, monthlyVolumes };
};

// ================================================================================================
// METRIC CATEGORY CALCULATORS (INTERNAL HELPERS)
// These functions consolidate the calculation and formatting of related financial metrics for different
// sections of the UI (e.g., Profitability, Valuation, Technicals).
// They typically take transformed stock data, specific financial values, peer averages (if applicable),
// and various formatting/calculation utility functions as input.
// They output an array of objects, where each object represents a displayable metric 
// with its name (label), formatted value, unit, an optional colorClass for positive/negative indication,
// an optional peerComparison object, and an explanation string for tooltips.
// ================================================================================================

/**
 * Calculates and formats overall analyst sentiment metrics.
 * This typically includes the consensus analyst rating for the stock.
 * @param {object} analystSentimentData - The analyst sentiment section from the adaptedStockData object (output of `apiAdapter.js`). Expected to contain `overallRating`.
 * @returns {Array<Object>} An array containing a single metric object for "Analyst Rating", including its value, unit (none), a color class based on sentiment (positive/negative/neutral), and an explanation.
 */
export const calculateOverallSentimentMetricsInternal = (analystSentimentData) => {
  const analystRatingRaw = getSafeInternal(() => analystSentimentData.overallRating, DEFAULT_NA_STRING);
  let sentimentColorClass = '';
  const ratingLowerCase = typeof analystRatingRaw === 'string' ? analystRatingRaw.toLowerCase() : '';
  if (['bullish', 'buy', 'strong buy', 'outperform', 'positive', 'accumulate', 'overweight'].some(term => ratingLowerCase.includes(term))) {
    sentimentColorClass = 'change-positive-text';
  } else if (['bearish', 'sell', 'strong sell', 'underperform', 'negative', 'reduce', 'underweight'].some(term => ratingLowerCase.includes(term))) {
    sentimentColorClass = 'change-negative-text';
  }
  return [
    {
      label: "Analyst Rating",
      value: analystRatingRaw,
      unit: "",
      colorClass: sentimentColorClass,
      explanation: "Analyst consensus (e.g., Buy, Hold, Sell) on stock's future. Expert opinion, use with other factors."
    }
  ];
};

/**
 * Calculates and formats key technical indicator metrics for display.
 * This includes 52-week high/low, day's percentage change, and selected moving averages (e.g., 50-day, 100-day MA)
 * along with the current price's position relative to these MAs.
 * @param {object} adaptedStockData - The fully adapted stock data object from `apiAdapter.js`.
 * @param {number|string} currentStockPrice - The current stock price (numeric or DEFAULT_NA_STRING for N/A).
 * @param {function} formatCurrencyInternal - Reference to the `formatCurrencyInternal` utility function for formatting monetary values.
 * @param {function} formatPercentageInternal - Reference to the `formatPercentageInternal` utility function for formatting percentage values.
 * @returns {Array<Object>} An array of technical indicator metric objects, each with `label`, `value`, `unit`, `explanation`, and optional `colorClass` or `symbolPrefix`.
 */
export const calculateKeyTechnicalIndicatorsInternal = (adaptedStockData, currentStockPrice, formatCurrencyInternal, formatPercentageInternal) => {
  // Access data from the new adaptedStockData structure
  const yearHighRaw = getSafeInternal(() => adaptedStockData.currentPrice.yearHigh);
  const yearLowRaw = getSafeInternal(() => adaptedStockData.currentPrice.yearLow);
  const momentumRaw = getSafeInternal(() => adaptedStockData.currentPrice.percentChange);
  const fiftyDayMARaw = getSafeInternal(() => adaptedStockData.technicalIndicators.sma50, DEFAULT_NA_STRING);
  const oneHundredDayMARaw = getSafeInternal(() => adaptedStockData.technicalIndicators.sma100, DEFAULT_NA_STRING);

  const formattedYearHigh = formatCurrencyInternal(yearHighRaw);
  const formattedYearLow = formatCurrencyInternal(yearLowRaw);
  let fiftyTwoWeekValue;
  let fiftyTwoWeekIsNAOverride = false;
  if (formattedYearHigh.value === DEFAULT_NA_STRING && formattedYearLow.value === DEFAULT_NA_STRING) {
    fiftyTwoWeekValue = DEFAULT_NA_STRING;
    fiftyTwoWeekIsNAOverride = true;
  } else {
    const highDisplay = formattedYearHigh.value === DEFAULT_NA_STRING ? DEFAULT_NA_STRING : `${formattedYearHigh.unit}${formattedYearHigh.value}`;
    const lowDisplay = formattedYearLow.value === DEFAULT_NA_STRING ? DEFAULT_NA_STRING : `${formattedYearLow.unit}${formattedYearLow.value}`;
    fiftyTwoWeekValue = `${highDisplay} / ${lowDisplay}`;
  }
  
  const priceVs50DMA = (currentStockPrice !== DEFAULT_NA_STRING && currentStockPrice !== null && fiftyDayMARaw !== DEFAULT_NA_STRING && parseFloat(fiftyDayMARaw) !== 0) 
                        ? ((parseFloat(currentStockPrice) / parseFloat(fiftyDayMARaw)) - 1) * 100 
                        : DEFAULT_NA_STRING;
  const priceVs100DMA = (currentStockPrice !== DEFAULT_NA_STRING && currentStockPrice !== null && oneHundredDayMARaw !== DEFAULT_NA_STRING && parseFloat(oneHundredDayMARaw) !== 0) 
                        ? ((parseFloat(currentStockPrice) / parseFloat(oneHundredDayMARaw)) - 1) * 100 
                        : DEFAULT_NA_STRING;

  return [
    {
      label: "52-Week High/Low",
      value: fiftyTwoWeekValue,
      unit: '',
      symbolPrefix: false,
      isNAOverride: fiftyTwoWeekIsNAOverride,
      explanation: "52-week high/low price. Shows recent trading range; potential support/resistance."
    },
    { label: "Day's % Change", ...formatPercentageInternal(momentumRaw, DEFAULT_NA_STRING, { colorOnPositiveNegative: true }), explanation: "Day's price % change vs previous close. Shows short-term momentum." },
    { label: "50-Day Moving Avg. (NSE)", ...formatCurrencyInternal(fiftyDayMARaw), explanation: "NSE 50-day avg. closing price. Medium-term trend & support/resistance indicator." },
    { label: "100-Day Moving Avg. (NSE)", ...formatCurrencyInternal(oneHundredDayMARaw), explanation: "NSE 100-day avg. closing price. Long-term trend indicator." },
    { label: "Price vs 50-Day MA", ...formatPercentageInternal(priceVs50DMA, DEFAULT_NA_STRING, { colorOnPositiveNegative: true }), explanation: "Price % vs 50-Day MA. Positive = above; negative = below." },
    { label: "Price vs 100-Day MA", ...formatPercentageInternal(priceVs100DMA, DEFAULT_NA_STRING, { colorOnPositiveNegative: true }), explanation: "Price % vs 100-Day MA. Positive = above; negative = below." }
  ];
};

/**
 * Calculates and formats key profitability metrics.
 * Metrics include Net Income, Net Profit Margin, Operating Income, Gross Profit, EBITDA, etc.
 * @param {Array<Object>} stockDataFinancials - The `financialStatements.yearly` array from the adaptedStockData object.
 * @param {function} findFinancialByYearInternal - Reference to the `findFinancialByYearInternal` utility.
 * @param {function} formatToCroresInternal - Reference to the `formatToCroresInternal` utility.
 * @param {function} formatPercentageInternal - Reference to the `formatPercentageInternal` utility.
 * @returns {object} An object containing: 
 *                    `metrics`: An array of profitability metric objects for display, each with `label`, `value` (formatted), `unit`, `explanation`, and optional `colorClass`.
 *                    `netIncomeRaw`: The raw Net Income value for the latest period, for potential use in other calculations.
 */
export const calculateProfitabilityMetricsInternal = (stockDataFinancials, findFinancialByYearInternal, formatToCroresInternal, formatPercentageInternal) => {
  const netIncomeRaw = findFinancialByYearInternal(stockDataFinancials, 0, STMT_INC, FIN_KEY_NET_INCOME);
  const revenueCurrentRaw = findFinancialByYearInternal(stockDataFinancials, 0, STMT_INC, FIN_KEY_REVENUE);
  const netProfitMarginRaw = (parseFloat(netIncomeRaw) / parseFloat(revenueCurrentRaw) * 100);
  const operatingIncomeRaw = findFinancialByYearInternal(stockDataFinancials, 0, STMT_INC, FIN_KEY_OPERATING_INCOME);
  const grossProfitRaw = findFinancialByYearInternal(stockDataFinancials, 0, STMT_INC, FIN_KEY_GROSS_PROFIT);
  const depreciationAndAmortizationINCRaw = findFinancialByYearInternal(stockDataFinancials, 0, STMT_INC, FIN_KEY_DEPRECIATION_AMORTIZATION_INC, DEFAULT_NA_STRING);
  const ebitdaRaw = parseFloat(operatingIncomeRaw) + parseFloat(depreciationAndAmortizationINCRaw === DEFAULT_NA_STRING ? 0 : depreciationAndAmortizationINCRaw);
  const unusualExpenseIncomeRaw = findFinancialByYearInternal(stockDataFinancials, 0, STMT_INC, FIN_KEY_UNUSUAL_EXPENSE_INCOME);
  const otherNetIncomeRaw = findFinancialByYearInternal(stockDataFinancials, 0, STMT_INC, FIN_KEY_OTHER_NET_INCOME);
  const minorityInterestINCRaw = findFinancialByYearInternal(stockDataFinancials, 0, STMT_INC, FIN_KEY_MINORITY_INTEREST_INC);
  
  const metrics = [
    { label: "Net Income", ...formatToCroresInternal(netIncomeRaw), explanation: "Net Income: Profit after all expenses, interest, and taxes; a key profitability measure." },
    { label: "Net Profit Margin", ...formatPercentageInternal(netProfitMarginRaw, DEFAULT_NA_STRING, { colorOnPositiveNegative: true }), explanation: "Net Profit Margin: Net Income / Revenue. Measures efficiency in converting revenue to profit. Higher is better." },
    { label: "Operating Income", ...formatToCroresInternal(operatingIncomeRaw), explanation: "Operating Income (EBIT): Profit from core business operations, before interest and taxes." },
    { label: "Gross Profit", ...formatToCroresInternal(grossProfitRaw), explanation: "Gross Profit: Revenue - Cost of Goods Sold (COGS). Shows production/service delivery efficiency." },
    { label: "EBITDA", ...formatToCroresInternal(ebitdaRaw), explanation: "EBITDA: Earnings Before Interest, Taxes, Depreciation & Amortization. Proxy for operational cash flow." },
    { label: "Depreciation & Amortization (Income St.)", ...formatToCroresInternal(depreciationAndAmortizationINCRaw), explanation: "D&A (Income St.): Non-cash expense for asset value decrease (tangible/intangible) over time."}, 
    { label: "Unusual Expense/(Income)", ...formatToCroresInternal(unusualExpenseIncomeRaw), explanation: "Unusual Expense/(Income): One-time/non-recurring items (e.g., restructuring). Can skew reported profit."}, 
    { label: "Other Income (Net)", ...formatToCroresInternal(otherNetIncomeRaw), explanation: "Other Income (Net): Net income/expense from non-core activities (e.g., investments, FX)."}, 
    { label: "Minority Interest (Income St.)", ...formatToCroresInternal(minorityInterestINCRaw), explanation: "Minority Interest (Inc. St.): Subsidiary income portion not owned by parent; reduces parent's net income."}
  ];
  return { metrics, netIncomeRaw };
};

/**
 * Calculates and formats key valuation metrics.
 * Metrics include P/E Ratio, P/B Ratio, Market Cap, NSE/BSE Price, Goodwill, and Intangible Assets.
 * Includes peer comparison details for P/E, P/B, and Market Cap.
 * @param {object} currentPriceData - The `currentPrice` section from adaptedStockData.
 * @param {object} primaryCompanyDataForMetrics - The `primaryCompanyPeerData` section from adaptedStockData (contains metrics like P/E, P/B for the main company).
 * @param {Array<Object>} stockDataFinancials - The `financialStatements.yearly` array from adaptedStockData.
 * @param {function} findFinancialByYearInternal - Reference to the `findFinancialByYearInternal` utility.
 * @param {function} formatRatioInternal - Reference to the `formatRatioInternal` utility.
 * @param {function} formatToCroresInternal - Reference to the `formatToCroresInternal` utility.
 * @param {function} formatCurrencyInternal - Reference to the `formatCurrencyInternal` utility.
 * @param {function} getPeerComparisonDetailsInternal - Reference to the `getPeerComparisonDetailsInternal` utility.
 * @param {object} avgPeerPE - Formatted peer average P/E object (output from `calculatePeerAverageInternal` via `formatRatioInternal`).
 * @param {object} avgPeerPB - Formatted peer average P/B object (output from `calculatePeerAverageInternal` via `formatRatioInternal`).
 * @param {object} avgPeerMarketCap - Formatted peer average Market Cap object (output from `calculatePeerAverageInternal` via `formatToCroresInternal`).
 * @returns {object} An object containing:
 *                    `metrics`: An array of valuation metric objects for display, with `label`, `value`, `unit`, `explanation`, `peerAverage`, and `peerComparison`.
 *                    `goodwillNetRaw`: Raw Goodwill value.
 *                    `intangiblesNetRaw`: Raw Intangible Assets value.
 *                    `nsePriceRaw`: Raw NSE price.
 *                    `bsePriceRaw`: Raw BSE price.
 */
export const calculateValuationMetricsInternal = (currentPriceData, primaryCompanyDataForMetrics, stockDataFinancials, findFinancialByYearInternal, formatRatioInternal, formatToCroresInternal, formatCurrencyInternal, getPeerComparisonDetailsInternal, avgPeerPE, avgPeerPB, avgPeerMarketCap) => {
  // Try direct path first, then fallback to price from primary company's peer data
  let nsePriceToUse = getSafeInternal(() => currentPriceData.nse);
  if (nsePriceToUse === DEFAULT_NA_STRING) {
    nsePriceToUse = getSafeInternal(() => primaryCompanyDataForMetrics.price); // .price from peer list item
  }
  const nsePriceRaw = nsePriceToUse;

  // BSE price usually doesn't have a common fallback in the single 'price' field of a peer item.
  const bsePriceRaw = getSafeInternal(() => currentPriceData.bse);
  
  const peRatioRaw = getSafeInternal(() => primaryCompanyDataForMetrics.priceToEarningsValueRatio); 
  const pbRatioRaw = getSafeInternal(() => primaryCompanyDataForMetrics.priceToBookValueRatio); 
  const marketCapRaw = getSafeInternal(() => primaryCompanyDataForMetrics.marketCap); 
  const goodwillNetRaw = findFinancialByYearInternal(stockDataFinancials, 0, STMT_BAL, FIN_KEY_GOODWILL_NET);
  const intangiblesNetRaw = findFinancialByYearInternal(stockDataFinancials, 0, STMT_BAL, FIN_KEY_INTANGIBLES_NET);

  const pePeerComparison = getPeerComparisonDetailsInternal(peRatioRaw, avgPeerPE, 'P/E', true);
  const pbPeerComparison = getPeerComparisonDetailsInternal(pbRatioRaw, avgPeerPB, 'P/B', true);
  const mcPeerComparison = getPeerComparisonDetailsInternal(marketCapRaw, avgPeerMarketCap, 'Market Cap', false, true);

  const metrics = [
    { 
      label: "P/E Ratio (TTM)", 
      ...formatRatioInternal(peRatioRaw), 
      peerAverage: avgPeerPE, 
      peerComparison: pePeerComparison,
      explanation: "Price / Trailing 12-Month Earnings Per Share. Lower may mean undervaluation; higher can suggest overvaluation or high growth expectations. Compare with peers." 
    },
    { 
      label: "P/B Ratio", 
      ...formatRatioInternal(pbRatioRaw), 
      peerAverage: avgPeerPB, 
      peerComparison: pbPeerComparison,
      explanation: "Price / Book Value per Share. <1 may suggest undervaluation; >1 (esp. >3) may indicate overvaluation. Industry context is key." 
    },
    { 
      label: "Market Cap", 
      ...formatToCroresInternal(marketCapRaw), 
      peerAverage: avgPeerMarketCap,
      peerComparison: mcPeerComparison,
      explanation: "Share Price x Total Shares Outstanding. Indicates company size." 
    }, 
    { label: "NSE Price", ...formatCurrencyInternal(nsePriceRaw), explanation: "Current share price on the National Stock Exchange of India; latest traded price." },
    { label: "BSE Price", ...formatCurrencyInternal(bsePriceRaw), explanation: "Current share price on the Bombay Stock Exchange of India; latest traded price." },
    { label: "Goodwill (Net)", ...formatToCroresInternal(goodwillNetRaw), explanation: "Premium paid for acquired assets (e.g., brand) over their fair value, less impairment charges."}, 
    { label: "Intangible Assets (Net)", ...formatToCroresInternal(intangiblesNetRaw), explanation: "Non-physical assets (e.g., patents, brand value), less amortization. Can drive future earnings."}
  ];
  return { metrics, goodwillNetRaw, intangiblesNetRaw, nsePriceRaw, bsePriceRaw };
};

/**
 * Calculates and formats key cash flow health metrics.
 * Metrics include Cash from Operating Activities (CFO), Capital Expenditure (CapEx), Free Cash Flow (FCF),
 * Net Change in Cash, CFO to Net Income Ratio, and Changes in Working Capital.
 * @param {Array<Object>} stockDataFinancials - The `financialStatements.yearly` array from adaptedStockData.
 * @param {number|string} netIncomeRaw - Raw Net Income for the latest period (passed from `calculateProfitabilityMetricsInternal`).
 * @param {function} findFinancialByYearInternal - Reference to the `findFinancialByYearInternal` utility.
 * @param {function} formatToCroresInternal - Reference to the `formatToCroresInternal` utility.
 * @param {function} formatRatioInternal - Reference to the `formatRatioInternal` utility.
 * @returns {object} An object containing:
 *                    `metrics`: An array of cash flow health metric objects for display, with `label`, `value`, `unit`, and `explanation`.
 *                    `fcfRaw`: Raw Free Cash Flow value for the latest period.
 */
export const calculateCashFlowHealthMetricsInternal = (stockDataFinancials, netIncomeRaw, findFinancialByYearInternal, formatToCroresInternal, formatRatioInternal) => {
  const cashFromOpsRaw = findFinancialByYearInternal(stockDataFinancials, 0, STMT_CAS, FIN_KEY_CASH_FROM_OPERATING_ACTIVITIES);
  const capExRaw = findFinancialByYearInternal(stockDataFinancials, 0, STMT_CAS, FIN_KEY_CAPITAL_EXPENDITURES);
  const fcfRaw = parseFloat(cashFromOpsRaw) + parseFloat(capExRaw === DEFAULT_NA_STRING ? 0 : capExRaw); 
  const netChangeInCashRaw = findFinancialByYearInternal(stockDataFinancials, 0, STMT_CAS, FIN_KEY_NET_CHANGE_IN_CASH);
  const ocfToNetIncomeRatioRaw = (netIncomeRaw !== DEFAULT_NA_STRING && parseFloat(netIncomeRaw) !== 0 && cashFromOpsRaw !== DEFAULT_NA_STRING) ? (parseFloat(cashFromOpsRaw) / parseFloat(netIncomeRaw)) : DEFAULT_NA_STRING;
  const changesInWorkingCapitalRaw = findFinancialByYearInternal(stockDataFinancials, 0, STMT_CAS, FIN_KEY_CHANGES_IN_WORKING_CAPITAL);
  
  const metrics = [
    { label: "Cash from Operating Activities (CFO)", ...formatToCroresInternal(cashFromOpsRaw), explanation: "Cash from daily business operations. Key to financial health; positive & growing is good." },
    { label: "Capital Expenditure (CapEx)", ...formatToCroresInternal(capExRaw), explanation: "Funds for acquiring/maintaining physical assets (PP&E). Usually a cash outflow (negative)." },
    { label: "Free Cash Flow (FCF)", ...formatToCroresInternal(fcfRaw), explanation: "Cash for investors after OpEx & CapEx (CFO + CapEx). Shows ability to fund growth, dividends etc." },
    { label: "Net Change in Cash", ...formatToCroresInternal(netChangeInCashRaw), explanation: "Net increase/decrease in cash & equivalents. Combined impact of operating, investing, financing." },
    { label: "Operating Cash Flow to Net Income Ratio", ...formatRatioInternal(ocfToNetIncomeRatioRaw), explanation: "Earnings quality (CFO / Net Income). >1 suggests high quality; <1 may flag issues."}, 
    { label: "Changes in Working Capital", ...formatToCroresInternal(changesInWorkingCapitalRaw), explanation: "Net change in current assets (receivables, inventory) & current liabilities (payables). Impacts CFO."}
  ];
  return { metrics, fcfRaw }; // Return fcfRaw for advanced cash flow insights if needed (or cashFromOpsRaw, capExRaw if preferred)
};

/**
 * Calculates and formats advanced cash flow insights.
 * Metrics include Non-Cash Items, D&A (from Cash Flow Statement), Cash Interest Paid,
 * Net Debt Issued/Retired, Cash Dividends Paid, Cash from Financing Activities, and FX Effects on Cash.
 * @param {Array<Object>} stockDataFinancials - The `financialStatements.yearly` array from adaptedStockData.
 * @param {function} findFinancialByYearInternal - Reference to the `findFinancialByYearInternal` utility.
 * @param {function} formatToCroresInternal - Reference to the `formatToCroresInternal` utility.
 * @returns {object} An object containing:
 *                    `metrics`: An array of advanced cash flow metric objects, with `label`, `value`, `unit`, `explanation`, and optional `className`.
 *                    `interestPaidCASRaw`: Raw Cash Interest Paid (from Cash Flow Statement) for the latest period.
 */
export const calculateAdvancedCashFlowInsightsInternal = (stockDataFinancials, findFinancialByYearInternal, formatToCroresInternal) => {
  const nonCashItemsCAS = findFinancialByYearInternal(stockDataFinancials, 0, STMT_CAS, FIN_KEY_NON_CASH_ITEMS_CAS);
  const netDebtIssuedRetiredCAS = findFinancialByYearInternal(stockDataFinancials, 0, STMT_CAS, FIN_KEY_ISSUANCE_RETIREMENT_DEBT_NET_CAS);
  const dividendsPaidCAS = findFinancialByYearInternal(stockDataFinancials, 0, STMT_CAS, FIN_KEY_TOTAL_CASH_DIVIDENDS_PAID_CAS);
  const fxEffectsCAS = findFinancialByYearInternal(stockDataFinancials, 0, STMT_CAS, FIN_KEY_FOREIGN_EXCHANGE_EFFECTS_CAS);
  const interestPaidCASRaw = findFinancialByYearInternal(stockDataFinancials, 0, STMT_CAS, FIN_KEY_CASH_INTEREST_PAID_CAS);
  const depreciationAmortizationCASRaw = findFinancialByYearInternal(stockDataFinancials, 0, STMT_CAS, FIN_KEY_DEPRECIATION_AMORTIZATION_CAS, DEFAULT_NA_STRING);
  const cashFromFinancingCASRaw = findFinancialByYearInternal(stockDataFinancials, 0, STMT_CAS, FIN_KEY_CASH_FROM_FINANCING_ACTIVITIES_CAS);

  const metrics = [
    { label: "Non-Cash Items (CFO Adj.)", ...formatToCroresInternal(nonCashItemsCAS), explanation: "Adjusts profit to real cash flow (adds back non-cash expenses, deducts non-cash income). For earnings quality."},
    { label: "Depreciation & Amortization (CFO Adj.)", ...formatToCroresInternal(depreciationAmortizationCASRaw), explanation: "Non-cash expense (asset wear/resource use), added back to reconcile NI to CFO. Key for capital-heavy firms."},
    { label: "Cash Interest Paid", ...formatToCroresInternal(interestPaidCASRaw), explanation: "Actual cash paid for debt interest. Shows true debt burden; high interest can be risky."},
    { label: "Net Debt Issued/(Retired)", ...formatToCroresInternal(netDebtIssuedRetiredCAS), explanation: "Net cash from new debt or debt repayment. Positive = more debt; negative = debt repaid. Part of CFF.", className: "sub-metric-cff" }, 
    { label: "Cash Dividends Paid", ...formatToCroresInternal(dividendsPaidCAS), explanation: "Total cash paid as dividends. Direct cash return to shareholders. Part of CFF.", className: "sub-metric-cff" }, 
    // Removed duplicate entries for Net Debt Issued/(Retired) and Cash Dividends Paid
    { label: "Cash from Financing Activities (CFF)", ...formatToCroresInternal(cashFromFinancingCASRaw), explanation: "Net cash from financing (debt, dividends, stock). Shows capital flow & funding strategy."},
    { label: "Foreign Exchange Effects on Cash", ...formatToCroresInternal(fxEffectsCAS), explanation: "FX rate change impact on foreign currency cash. Reconciles total cash change."}
  ];
  return { metrics, interestPaidCASRaw };
};

/**
 * Calculates financial health and debt metrics.
 * @param {Array<Object>} stockDataFinancials - Yearly financial data.
 * @param {number} interestPaidCASRaw - Raw cash interest paid from advanced cash flow insights.
 * @param {function} findFinancialByYearInternal - Utility.
 * @param {function} formatToCroresInternal - Utility.
 * @param {function} formatRatioInternal - Utility.
 * @param {function} formatCurrencyInternal - Utility.
 * @returns {object} Contains `metrics` array and raw values like `totalAssetsBALRaw`, `tangibleBookValuePerShareRaw`, `totalEquityRaw`.
 */
export const calculateFinancialHealthAndDebtMetricsInternal = (stockDataFinancials, interestPaidCASRaw, findFinancialByYearInternal, formatToCroresInternal, formatRatioInternal, formatCurrencyInternal) => {
  const totalDebtRaw = findFinancialByYearInternal(stockDataFinancials, 0, STMT_BAL, FIN_KEY_TOTAL_DEBT);
  const totalEquityRaw = findFinancialByYearInternal(stockDataFinancials, 0, STMT_BAL, FIN_KEY_TOTAL_EQUITY);
  const debtToEquityRatioRaw = (totalEquityRaw !== DEFAULT_NA_STRING && parseFloat(totalEquityRaw) !== 0 && totalDebtRaw !== DEFAULT_NA_STRING) ? (parseFloat(totalDebtRaw) / parseFloat(totalEquityRaw)) : DEFAULT_NA_STRING;
  const tangibleBookValuePerShareRaw = findFinancialByYearInternal(stockDataFinancials, 0, STMT_BAL, FIN_KEY_TANGIBLE_BOOK_VALUE_PER_SHARE);
  const netInterestIncomeExpenseINCRaw = findFinancialByYearInternal(stockDataFinancials, 0, STMT_INC, FIN_KEY_INTEREST_INC_EXP_NET_NON_OP);
  const longTermInvestmentsBALRaw = findFinancialByYearInternal(stockDataFinancials, 0, STMT_BAL, FIN_KEY_LONG_TERM_INVESTMENTS);
  const accruedExpensesBALRaw = findFinancialByYearInternal(stockDataFinancials, 0, STMT_BAL, FIN_KEY_ACCRUED_EXPENSES);
  const otherCurrentLiabilitiesBALRaw = findFinancialByYearInternal(stockDataFinancials, 0, STMT_BAL, FIN_KEY_OTHER_CURRENT_LIABILITIES);
  const otherNonCurrentLiabilitiesBALRaw = findFinancialByYearInternal(stockDataFinancials, 0, STMT_BAL, FIN_KEY_OTHER_NON_CURRENT_LIABILITIES);
  const totalAssetsBALRaw = findFinancialByYearInternal(stockDataFinancials, 0, STMT_BAL, FIN_KEY_TOTAL_ASSETS);

  const metrics = [
    { label: "Total Assets", ...formatToCroresInternal(totalAssetsBALRaw), explanation: "Total company resources (current & non-current assets). Represents investments."}, 
    { label: "Total Debt", ...formatToCroresInternal(totalDebtRaw), explanation: "Total outstanding borrowings (short & long-term). Indicates financial obligations." },
    { label: "Total Equity", ...formatToCroresInternal(totalEquityRaw), explanation: "Company net worth (Assets - Liabilities). Shareholders' stake & retained earnings." },
    { label: "Debt-to-Equity Ratio", ...formatRatioInternal(debtToEquityRatioRaw), explanation: "Financial leverage (Debt / Equity). Higher = more risk/debt reliance. Lower is safer. Industry varies." },
    { label: "Interest Paid (from Cash Flow St.)", ...formatToCroresInternal(interestPaidCASRaw), explanation: "Actual cash paid for interest (from CFS). Shows real debt burden." },
    { label: "Net Interest Income/(Expense) (from Income St.)", ...formatToCroresInternal(netInterestIncomeExpenseINCRaw), explanation: "Net interest income (from investments) - interest expense (on debt) (from IS). Can be +/-."}, 
    { label: "Tangible Book Value per Share", ...formatCurrencyInternal(tangibleBookValuePerShareRaw), explanation: "Book value/share (excl. goodwill, intangibles). Conservative per-share value measure." },
    { label: "Long Term Investments", ...formatToCroresInternal(longTermInvestmentsBALRaw), explanation: "Investments held >1 year (stocks, bonds, real estate, subsidiaries/associates)."}, 
    { label: "Accrued Expenses", ...formatToCroresInternal(accruedExpensesBALRaw), explanation: "Expenses incurred but not yet paid (e.g., salaries, period-end utilities). Current liability."}, 
    { label: "Other Current Liabilities", ...formatToCroresInternal(otherCurrentLiabilitiesBALRaw), explanation: "Short-term obligations (<1yr) not in standard categories (e.g., deferred revenue, taxes payable)."}, 
    { label: "Other Non-Current Liabilities", ...formatToCroresInternal(otherNonCurrentLiabilitiesBALRaw), explanation: "Long-term obligations (>1yr) not in standard categories (e.g., deferred tax, pensions)."}
  ];
  return { metrics, totalAssetsBALRaw, tangibleBookValuePerShareRaw, totalEquityRaw };
};

/**
 * Calculates asset quality insights.
 * @param {number} totalAssetsBALRaw - Raw total assets.
 * @param {number} goodwillNetRaw - Raw net goodwill.
 * @param {number} intangiblesNetRaw - Raw net intangibles.
 * @param {function} formatPercentageInternal - Utility.
 * @returns {object} Contains `metrics` array.
 */
export const calculateAssetQualityInsightsInternal = (totalAssetsBALRaw, goodwillNetRaw, intangiblesNetRaw, formatPercentageInternal) => {
  const goodwillPercentOfAssets = (parseFloat(totalAssetsBALRaw) > 0 && goodwillNetRaw !== DEFAULT_NA_STRING) ? (parseFloat(goodwillNetRaw) / parseFloat(totalAssetsBALRaw) * 100) : DEFAULT_NA_STRING;
  const intangiblesPercentOfAssets = (parseFloat(totalAssetsBALRaw) > 0 && intangiblesNetRaw !== DEFAULT_NA_STRING) ? (parseFloat(intangiblesNetRaw) / parseFloat(totalAssetsBALRaw) * 100) : DEFAULT_NA_STRING;
  
  const metrics = [
    { label: "Goodwill as % of Total Assets", ...formatPercentageInternal(goodwillPercentOfAssets), explanation: "Goodwill as % of total assets. High % can risk write-downs if acquisitions underperform."},
    { label: "Intangibles as % of Total Assets", ...formatPercentageInternal(intangiblesPercentOfAssets), explanation: "Intangibles (excl. goodwill) as % of total assets."}
  ];
  return { metrics }; // Only metrics are returned
};

/**
 * Calculates shareholder returns metrics.
 * @param {Array<Object>} stockDataFinancials - Yearly financial data.
 * @param {object} primaryCompanyPeerData - Primary company peer data.
 * @param {object} avgPeerDivYield - Formatted peer average dividend yield.
 * @param {function} findFinancialByYearInternal - Utility.
 * @param {function} formatCurrencyInternal - Utility.
 * @param {function} formatPercentageInternal - Utility.
 * @param {function} getPeerComparisonDetailsInternal - Utility.
 * @returns {object} Contains `metrics` array and `epsDilutedCurrentYoY` (YoY EPS growth raw value).
 */
export const calculateShareholderReturnsMetricsInternal = (stockDataFinancials, primaryCompanyPeerData, avgPeerDivYield, findFinancialByYearInternal, formatCurrencyInternal, formatPercentageInternal, getPeerComparisonDetailsInternal) => {
  const epsDilutedCurrentYoY = findFinancialByYearInternal(stockDataFinancials, 0, STMT_INC, FIN_KEY_DILUTED_EPS_EXCL_EXTRA_ORD);
  const dpsRaw = findFinancialByYearInternal(stockDataFinancials, 0, STMT_INC, FIN_KEY_DPS_COMMON_STOCK);
  const dividendYieldRaw = getSafeInternal(() => primaryCompanyPeerData.dividendYieldIndicatedAnnualDividend);
  const payoutRatioRaw = (epsDilutedCurrentYoY !== DEFAULT_NA_STRING && parseFloat(epsDilutedCurrentYoY) !== 0 && dpsRaw !== DEFAULT_NA_STRING) ? (parseFloat(dpsRaw) / parseFloat(epsDilutedCurrentYoY)) * 100 : DEFAULT_NA_STRING;

  const divYieldPeerComparison = getPeerComparisonDetailsInternal(dividendYieldRaw, avgPeerDivYield, 'Dividend Yield');

  const metrics = [
    { label: "Dividend Per Share (DPS)", ...formatCurrencyInternal(dpsRaw), explanation: "DPS: Total dividends paid per share. Direct cash return to shareholders." },
    { 
      label: "Dividend Yield (%) ", 
      ...formatPercentageInternal(dividendYieldRaw, DEFAULT_NA_STRING, { colorOnPositiveNegative: true }), 
      peerAverage: avgPeerDivYield, 
      peerComparison: divYieldPeerComparison,
      explanation: "Dividend Yield (%): Annual DPS / Current Share Price. Return from dividends relative to price." 
    },
    { label: "Payout Ratio (%) ", ...formatPercentageInternal(payoutRatioRaw), explanation: "Payout Ratio (%): DPS / EPS. % of earnings paid as dividends. High ratio may be unsustainable; low can mean reinvestment for growth." }
  ];
  return { metrics, epsDilutedCurrentYoY };
};

/**
 * Calculates share capital insights.
 * @param {Array<Object>} stockDataFinancials - Yearly financial data.
 * @param {number} totalEquityRaw - Raw total equity.
 * @param {function} findFinancialByYearInternal - Utility.
 * @param {function} formatCurrencyInternal - Utility.
 * @returns {object} Contains `metrics` array.
 */
export const calculateShareCapitalInsightsInternal = (stockDataFinancials, totalEquityRaw, findFinancialByYearInternal, formatCurrencyInternal) => {
  const totalCommonSharesBAL = findFinancialByYearInternal(stockDataFinancials, 0, STMT_BAL, FIN_KEY_TOTAL_COMMON_SHARES_OUTSTANDING);
  const dilutedAvgSharesINC = findFinancialByYearInternal(stockDataFinancials, 0, STMT_INC, FIN_KEY_DILUTED_WEIGHTED_AVG_SHARES);
  const bookValuePerShareTotalEquity = (totalEquityRaw !== DEFAULT_NA_STRING && totalCommonSharesBAL !== DEFAULT_NA_STRING && parseFloat(totalCommonSharesBAL) !== 0) 
                                      ? (parseFloat(totalEquityRaw) / parseFloat(totalCommonSharesBAL))
                                      : DEFAULT_NA_STRING;
  const metrics = [
    { label: "Total Common Shares Outstanding", value: parseFloat(totalCommonSharesBAL).toLocaleString('en-IN'), unit: '', raw: parseFloat(totalCommonSharesBAL), explanation: "Total common shares issued & held by investors. Used for per-share metrics."}, 
    { label: "Diluted Weighted Avg Shares", value: parseFloat(dilutedAvgSharesINC).toLocaleString('en-IN'), unit: '', raw: parseFloat(dilutedAvgSharesINC), explanation: "Avg. shares if all dilutive securities (options, etc.) exercised. Used for diluted EPS."},
    { label: "Book Value per Share (Total Equity)", ...formatCurrencyInternal(bookValuePerShareTotalEquity), explanation: "Total equity / total common shares. Net asset value per share."}
  ];
  return { metrics }; 
};

/**
 * Calculates efficiency ratios.
 * @param {object} primaryCompanyPeerData - Primary company peer data.
 * @param {number} netIncomeRaw - Raw net income.
 * @param {number} totalAssetsBALRaw - Raw total assets.
 * @param {object} avgPeerRoE - Formatted peer average Return on Equity.
 * @param {function} formatPercentageInternal - Utility.
 * @param {function} getPeerComparisonDetailsInternal - Utility.
 * @returns {object} Contains `metrics` array.
 */
export const calculateEfficiencyRatiosInternal = (primaryCompanyPeerData, netIncomeRaw, totalAssetsBALRaw, avgPeerRoE, formatPercentageInternal, getPeerComparisonDetailsInternal) => {
  const roeTTMRaw = getSafeInternal(() => primaryCompanyPeerData.returnOnAverageEquityTrailing12Month);
  const roe5YAvgRaw = getSafeInternal(() => primaryCompanyPeerData.returnOnAverageEquity5YearAverage);
  const roaTTMRaw = (netIncomeRaw !== DEFAULT_NA_STRING && totalAssetsBALRaw !== DEFAULT_NA_STRING && parseFloat(totalAssetsBALRaw) !== 0) ? (parseFloat(netIncomeRaw) / parseFloat(totalAssetsBALRaw) * 100) : DEFAULT_NA_STRING;

  const roePeerComparison = getPeerComparisonDetailsInternal(roeTTMRaw, avgPeerRoE, 'RoE');

  const metrics = [
    { 
      label: "Return on Equity (RoE % - TTM)", 
      ...formatPercentageInternal(roeTTMRaw, DEFAULT_NA_STRING, { colorOnPositiveNegative: true }), 
      peerAverage: avgPeerRoE, 
      peerComparison: roePeerComparison,
      explanation: "Profitability vs shareholders' equity (NI / Avg. Equity) TTM. Higher = better use of shareholder funds." 
    },
    { label: "Return on Equity (RoE % - 5Y Avg)", ...formatPercentageInternal(roe5YAvgRaw, DEFAULT_NA_STRING, { colorOnPositiveNegative: true }), explanation: "5-year avg. RoE. Smooths fluctuations, shows long-term profit efficiency from equity." },
    { label: "Return on Assets (RoA % - TTM)", ...formatPercentageInternal(roaTTMRaw, DEFAULT_NA_STRING, { colorOnPositiveNegative: true }), explanation: "Efficiency of asset use for earnings (NI / Avg. Total Assets) TTM. Higher = better asset use." }
  ];
  return { metrics }; 
};

/**
 * Calculates operational efficiency metrics.
 * @param {Array<Object>} stockDataFinancials - Yearly financial data.
 * @param {object} financialsPreviousYear - Financial data for the previous year.
 * @param {function} findFinancialByYearInternal - Utility.
 * @param {function} formatToCroresInternal - Utility.
 * @param {function} calculateYoYGrowthInternal - Utility.
 * @returns {object} Contains `metrics` array.
 */
export const calculateOperationalEfficiencyMetricsInternal = (stockDataFinancials, financialsPreviousYear, findFinancialByYearInternal, formatToCroresInternal, calculateYoYGrowthInternal) => {
  const totalInventoryBAL = findFinancialByYearInternal(stockDataFinancials, 0, STMT_BAL, FIN_KEY_TOTAL_INVENTORY);
  const totalInventoryPreviousBAL = financialsPreviousYear !== DEFAULT_NA_STRING ? findFinancialByYearInternal(stockDataFinancials, 1, STMT_BAL, FIN_KEY_TOTAL_INVENTORY) : DEFAULT_NA_STRING;
  
  const metrics = [
    { label: "Total Inventory", ...formatToCroresInternal(totalInventoryBAL), explanation: "Value of raw materials, WIP, and finished goods held."},
    { label: "Inventory Growth (YoY)", ...calculateYoYGrowthInternal(totalInventoryBAL, totalInventoryPreviousBAL), explanation: "YoY % change in total inventory. Rapid growth without sales growth can be a warning."}
  ];
  return { metrics }; 
};

/**
 * Calculates growth trends (YoY %).
 * @param {Array<Object>} stockDataFinancials - Yearly financial data.
 * @param {object} financialsPreviousYear - Financial data for the previous year.
 * @param {number} netIncomeRaw - Raw net income.
 * @param {number} epsDilutedCurrentYoY - Raw YoY EPS growth.
 * @param {number} tangibleBookValuePerShareRaw - Raw tangible book value per share.
 * @param {function} findFinancialByYearInternal - Utility.
 * @param {function} calculateYoYGrowthInternal - Utility.
 * @returns {object} Contains `metrics` array.
 */
export const calculateGrowthTrendsMetricsInternal = (stockDataFinancials, financialsPreviousYear, netIncomeRaw, epsDilutedCurrentYoY, tangibleBookValuePerShareRaw, findFinancialByYearInternal, calculateYoYGrowthInternal) => {
  const revenueCurrentYoY = findFinancialByYearInternal(stockDataFinancials, 0, STMT_INC, FIN_KEY_REVENUE);
  const revenuePreviousYoY = financialsPreviousYear !== DEFAULT_NA_STRING ? findFinancialByYearInternal(stockDataFinancials, 1, STMT_INC, FIN_KEY_REVENUE) : DEFAULT_NA_STRING;
  const netIncomePreviousYoY = financialsPreviousYear !== DEFAULT_NA_STRING ? findFinancialByYearInternal(stockDataFinancials, 1, STMT_INC, FIN_KEY_NET_INCOME) : DEFAULT_NA_STRING;
  const epsDilutedPreviousYoY = financialsPreviousYear !== DEFAULT_NA_STRING ? findFinancialByYearInternal(stockDataFinancials, 1, STMT_INC, FIN_KEY_DILUTED_EPS_EXCL_EXTRA_ORD) : DEFAULT_NA_STRING;
  const bookValueCurrentYoY = tangibleBookValuePerShareRaw; 
  const bookValuePreviousYoY = financialsPreviousYear !== DEFAULT_NA_STRING ? findFinancialByYearInternal(stockDataFinancials, 1, STMT_BAL, FIN_KEY_TANGIBLE_BOOK_VALUE_PER_SHARE) : DEFAULT_NA_STRING;

  const metrics = [
    { label: "Revenue Growth (YoY)", ...calculateYoYGrowthInternal(revenueCurrentYoY, revenuePreviousYoY), explanation: "YoY % change in total revenue. Shows sales growth rate; consistent positive growth is good." },
    { label: "Net Income Growth (YoY)", ...calculateYoYGrowthInternal(netIncomeRaw, netIncomePreviousYoY), explanation: "YoY % change in net profit. Shows bottom-line profit growth; key for valuation." },
    { label: "EPS Growth (Diluted, YoY)", ...calculateYoYGrowthInternal(epsDilutedCurrentYoY, epsDilutedPreviousYoY), explanation: "YoY % change in diluted EPS. Per-share profit growth (accounts for potential shares). Key for investors." },
    { label: "Tangible Book Value Growth (YoY)", ...calculateYoYGrowthInternal(bookValueCurrentYoY, bookValuePreviousYoY), explanation: "YoY % change in tangible book value/share. Growth in underlying net asset value/share (excl. intangibles)." }
  ];
  return { metrics }; 
};

/**
 * Calculates historical performance metrics (CAGR).
 * @param {Array<Object>} stockDataFinancials - Yearly financial data.
 * @param {function} findFinancialByYearInternal - Utility.
 * @param {function} calculateCAGRInternal - Utility.
 * @returns {object} Contains `metrics` array.
 */
export const calculateHistoricalPerformanceMetricsInternal = (stockDataFinancials, findFinancialByYearInternal, calculateCAGRInternal) => {
  const metrics = [];
  const cagrMetricDefinitions = [
    { key: 'Revenue', label: 'Revenue', statement: 'INC' },
    { key: 'NetIncome', label: 'Net Income', statement: 'INC' },
    { key: 'DilutedEPSExcludingExtraOrdItems', label: 'Diluted EPS', statement: 'INC' }
  ];
  const numFinancialYears = stockDataFinancials.length;

  cagrMetricDefinitions.forEach(metricDef => {
    const currentValue = findFinancialByYearInternal(stockDataFinancials, 0, metricDef.statement, metricDef.key);
    if (numFinancialYears >= 3) {
      const startValue3Y = findFinancialByYearInternal(stockDataFinancials, 2, metricDef.statement, metricDef.key);
      metrics.push({
        label: `${metricDef.label} CAGR (3Y)`,
        ...calculateCAGRInternal(currentValue, startValue3Y, 2),
        explanation: `3Y CAGR of ${metricDef.label.toLowerCase()}.`
      });
    }
    if (numFinancialYears >= 5) {
      const startValue5Y = findFinancialByYearInternal(stockDataFinancials, 4, metricDef.statement, metricDef.key);
      metrics.push({
        label: `${metricDef.label} CAGR (5Y)`,
        ...calculateCAGRInternal(currentValue, startValue5Y, 4),
        explanation: `5Y CAGR of ${metricDef.label.toLowerCase()}.`
      });
    }
  });
  return { metrics }; 
};

/**
 * Calculates liquidity ratios.
 * @param {Array<Object>} stockDataFinancials - Yearly financial data.
 * @param {function} findFinancialByYearInternal - Utility.
 * @param {function} formatToCroresInternal - Utility.
 * @param {function} formatRatioInternal - Utility.
 * @returns {object} Contains `metrics` array.
 */
export const calculateLiquidityRatiosInternal = (stockDataFinancials, findFinancialByYearInternal, formatToCroresInternal, formatRatioInternal) => {
  const cashAndShortTermInvRaw = findFinancialByYearInternal(stockDataFinancials, 0, 'BAL', 'CashandShortTermInvestments');
  const totalCurrentAssetsRaw = findFinancialByYearInternal(stockDataFinancials, 0, 'BAL', 'TotalCurrentAssets');
  const totalCurrentLiabilitiesRaw = findFinancialByYearInternal(stockDataFinancials, 0, 'BAL', 'TotalCurrentLiabilities');
  const currentRatioRaw = (totalCurrentLiabilitiesRaw !== DEFAULT_NA_STRING && parseFloat(totalCurrentLiabilitiesRaw) !== 0 && totalCurrentAssetsRaw !== DEFAULT_NA_STRING) ? (parseFloat(totalCurrentAssetsRaw) / parseFloat(totalCurrentLiabilitiesRaw)) : DEFAULT_NA_STRING;

  const metrics = [
    { label: "Cash & Short Term Investments", ...formatToCroresInternal(cashAndShortTermInvRaw), explanation: "Most liquid assets (cash, deposits, money market, etc.). Buffer for short-term needs." },
    { label: "Total Current Assets", ...formatToCroresInternal(totalCurrentAssetsRaw), explanation: "Assets convertible to cash <1 year (cash, receivables, inventory). Shows short-term resources."}, 
    { label: "Total Current Liabilities", ...formatToCroresInternal(totalCurrentLiabilitiesRaw), explanation: "Obligations due <1 year (payables, short-term debt, accrued expenses). Short-term commitments."}, 
    { label: "Current Ratio", ...formatRatioInternal(currentRatioRaw), explanation: "Ability to cover short-term liabilities with short-term assets (Current Assets / Current Liabilities). >1 preferred. Industry varies." }
  ];
  return { metrics };
};

// ================================================================================================
// EXPORT MAP (Exposing internal functions with simplified names for use in App.js)
// ================================================================================================
// This pattern allows App.js to import these functions without the 'Internal' suffix,
// while keeping the more descriptive names within this utils.js file.
// ================================================================================================
export const getSafe = getSafeInternal;
export const findFinancialByYear = findFinancialByYearInternal;
export const formatToCrores = formatToCroresInternal;
export const formatPercentage = formatPercentageInternal;
export const formatRatio = formatRatioInternal;
export const formatCurrency = formatCurrencyInternal;
export const calculateTenure = calculateTenureInternal;
export const calculateYoYGrowth = calculateYoYGrowthInternal;
export const calculateCAGR = calculateCAGRInternal;
export const getPrimaryCompanyDataFromPeerList = getPrimaryCompanyDataFromPeerListInternal;
export const calculatePeerAverage = calculatePeerAverageInternal;
export const getPeerComparisonDetails = getPeerComparisonDetailsInternal;
export const calculateSMA = calculateSMAInternal;
export const calculateEMA = calculateEMAInternal;
export const calculateRSI = calculateRSIInternal;
export const calculateBollingerBands = calculateBollingerBandsInternal;
export const calculateOverallSentimentMetrics = calculateOverallSentimentMetricsInternal;
export const calculateKeyTechnicalIndicators = calculateKeyTechnicalIndicatorsInternal;
export const calculateProfitabilityMetrics = calculateProfitabilityMetricsInternal;
export const calculateValuationMetrics = calculateValuationMetricsInternal;
export const calculateCashFlowHealthMetrics = calculateCashFlowHealthMetricsInternal;
export const calculateAdvancedCashFlowInsights = calculateAdvancedCashFlowInsightsInternal;
export const calculateFinancialHealthAndDebtMetrics = calculateFinancialHealthAndDebtMetricsInternal;
export const calculateAssetQualityInsights = calculateAssetQualityInsightsInternal;
export const calculateShareholderReturnsMetrics = calculateShareholderReturnsMetricsInternal;
export const calculateShareCapitalInsights = calculateShareCapitalInsightsInternal;
export const calculateEfficiencyRatios = calculateEfficiencyRatiosInternal;
export const calculateOperationalEfficiencyMetrics = calculateOperationalEfficiencyMetricsInternal;
export const calculateGrowthTrendsMetrics = calculateGrowthTrendsMetricsInternal;
export const calculateHistoricalPerformanceMetrics = calculateHistoricalPerformanceMetricsInternal;
export const calculateLiquidityRatios = calculateLiquidityRatiosInternal; 