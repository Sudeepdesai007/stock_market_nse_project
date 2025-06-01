// apiAdapter.js
// This module is responsible for transforming raw API responses from various stock market data sources
// into a consistent, predictable, and application-friendly structure.
// It decouples the main application logic from the specifics of the API response formats,
// making it easier to adapt to API changes or integrate new data sources.

import {
  DEFAULT_NA_STRING,
  getSafe,
  // Import financial key constants that will be used for mapping/known keys if needed
  // STMT_INC, STMT_BAL, STMT_CAS, (and specific FIN_KEY_... if directly used in adapter)
  getPrimaryCompanyDataFromPeerList, // Util to find primary company's data within peer list
} from './utils';

/**
 * Transforms the raw financial statements data (annual or quarterly).
 * It restructures the financial data into separate objects for income statement,
 * balance sheet, and cash flow statement for each financial year/period.
 * @param {Array<Object>} rawFinancials - Array of raw financial period data from the API.
 * @returns {Array<Object>} An array of transformed financial data, structured by year/period.
 */
const transformFinancialStatements = (rawFinancials) => {
  if (!rawFinancials || !Array.isArray(rawFinancials)) {
    return [];
  }
  return rawFinancials.map(yearlyFinancial => {
    const transformedYearly = {
      year: getSafe(() => yearlyFinancial.yearName, DEFAULT_NA_STRING),
      // other top-level year data if any, like periodEndDate
      periodEndDate: getSafe(() => yearlyFinancial.periodEndDate, DEFAULT_NA_STRING),
      incomeStatement: {},
      balanceSheet: {},
      cashFlowStatement: {},
    };

    const financialMap = getSafe(() => yearlyFinancial.stockFinancialMap, {});

    // Transform Income Statement (INC)
    // Maps each item from the API's income statement array to a key-value pair.
    const incomeItems = getSafe(() => financialMap.INC, []);
    incomeItems.forEach(item => {
      transformedYearly.incomeStatement[getSafe(() => item.key, 'unknownKey')] = getSafe(() => item.value, DEFAULT_NA_STRING);
    });

    // Transform Balance Sheet (BAL)
    // Maps each item from the API's balance sheet array to a key-value pair.
    const balanceItems = getSafe(() => financialMap.BAL, []);
    balanceItems.forEach(item => {
      transformedYearly.balanceSheet[getSafe(() => item.key, 'unknownKey')] = getSafe(() => item.value, DEFAULT_NA_STRING);
    });

    // Transform Cash Flow Statement (CAS)
    // Maps each item from the API's cash flow statement array to a key-value pair.
    const cashFlowItems = getSafe(() => financialMap.CAS, []);
    cashFlowItems.forEach(item => {
      transformedYearly.cashFlowStatement[getSafe(() => item.key, 'unknownKey')] = getSafe(() => item.value, DEFAULT_NA_STRING);
    });

    return transformedYearly;
  });
};

/**
 * Transforms the raw company profile data.
 * It extracts and structures key information like company details, executives, and peer company data.
 * @param {Object} rawProfile - The raw companyProfile object from the API.
 * @param {Object} rawStockData - The top-level raw stock data object from the API, used for fallback or additional info.
 * @param {Object} primaryCompanyPeerDataForSentiment - Data for the primary company, extracted from its own peer list, for sentiment and key ratios.
 * @returns {Object} A structured company profile object.
 */
const transformCompanyProfile = (rawProfile, rawStockData, primaryCompanyPeerDataForSentiment) => {
    if (!rawProfile) return {};

    // Correctly map executives from the likely raw API structure
    const rawExecutiveData = getSafe(() => rawProfile.officers.officer, []);
    const executives = rawExecutiveData.map(exec => {
        const firstName = getSafe(() => exec.firstName, '');
        const middleInitial = getSafe(() => exec.mI, '');
        const lastName = getSafe(() => exec.lastName, '');
        
        let fullName = `${firstName} ${middleInitial} ${lastName}`.replace(/\s+/g, ' ').trim();
        if (!fullName) fullName = DEFAULT_NA_STRING;

        let displayTitle = DEFAULT_NA_STRING;
        const titleObj = getSafe(() => exec.title);
        const fullTitleValue = getSafe(() => titleObj.Value, DEFAULT_NA_STRING);

        // The API provides title as an object with abbreviations (abbr1, abbr2) and a full "Value".
        // This logic attempts to construct the most descriptive title.
        if (typeof titleObj === 'object' && titleObj !== null) {
            const abbr1 = getSafe(() => titleObj.abbr1, '').trim();
            const abbr2 = getSafe(() => titleObj.abbr2, '').trim();
            let abbrPrefix = '';

            if (abbr1 && abbr2) {
                abbrPrefix = `${abbr1} ${abbr2} - `;
            } else if (abbr1) {
                abbrPrefix = `${abbr1} - `;
            } else if (abbr2) {
                abbrPrefix = `${abbr2} - `;
            }

            if (fullTitleValue !== DEFAULT_NA_STRING) {
                displayTitle = `${abbrPrefix}${fullTitleValue}`;
            } else if (abbrPrefix) {
                // If full title is N/A but we have abbreviations, show them
                displayTitle = abbrPrefix.replace(/\s-\s$/, ''); // Remove trailing " - "
            }
        } else if (fullTitleValue !== DEFAULT_NA_STRING) {
            // Fallback if titleObj is not an object but fullTitleValue was somehow directly available
            displayTitle = fullTitleValue;
        }
        // If titleObj was something else (e.g. a direct string, though API sample shows object)
        // and fullTitleValue also ended up as N/A, displayTitle remains DEFAULT_NA_STRING

        return {
            name: fullName,
            title: displayTitle,
            since: getSafe(() => exec.since, DEFAULT_NA_STRING),
        };
    });

    const peerList = getSafe(() => rawProfile.peerCompanyList, []);
    const actualPeersForProfile = peerList.map(p => ({
        tickerId: getSafe(() => p.tickerId, DEFAULT_NA_STRING),
        companyName: getSafe(() => p.companyName, DEFAULT_NA_STRING),
        marketCap: getSafe(() => p.marketCap, DEFAULT_NA_STRING),
        priceToEarningsValueRatio: getSafe(() => p.priceToEarningsValueRatio, DEFAULT_NA_STRING),
        priceToBookValueRatio: getSafe(() => p.priceToBookValueRatio, DEFAULT_NA_STRING),
        dividendYieldIndicatedAnnualDividend: getSafe(() => p.dividendYieldIndicatedAnnualDividend, DEFAULT_NA_STRING),
        returnOnAverageEquityTrailing12Month: getSafe(() => p.returnOnAverageEquityTrailing12Month, DEFAULT_NA_STRING),
        price: getSafe(() => p.price, DEFAULT_NA_STRING), 
        netChange: getSafe(() => p.netChange, DEFAULT_NA_STRING),
        percentChange: getSafe(() => p.percentChange, DEFAULT_NA_STRING),
        overallRating: getSafe(() => p.overallRating, DEFAULT_NA_STRING),
    })); 

    return {
        name: getSafe(() => rawStockData.companyName, DEFAULT_NA_STRING),
        symbolNse: getSafe(() => rawProfile.exchangeCodeNse, DEFAULT_NA_STRING),
        symbolBse: getSafe(() => rawProfile.exchangeCodeBse, DEFAULT_NA_STRING),
        isin: getSafe(() => rawProfile.isInId, DEFAULT_NA_STRING),
        description: getSafe(() => rawProfile.companyDescription, DEFAULT_NA_STRING),
        industry: getSafe(() => rawProfile.industry, getSafe(() => rawStockData.industry, DEFAULT_NA_STRING)),
        sector: getSafe(() => rawProfile.mgIndustry, DEFAULT_NA_STRING),
        website: getSafe(() => rawProfile.website, DEFAULT_NA_STRING),
        incorporationDate: getSafe(() => rawProfile.incorporationDate, DEFAULT_NA_STRING),
        listingDateNse: getSafe(() => rawProfile.listingDateNse, DEFAULT_NA_STRING),
        listingDateBse: getSafe(() => rawProfile.listingDateBse, DEFAULT_NA_STRING),
        marketCap: getSafe(() => primaryCompanyPeerDataForSentiment.marketCap, DEFAULT_NA_STRING), // from primary company data in peer list
        peRatio: getSafe(() => primaryCompanyPeerDataForSentiment.priceToEarningsValueRatio, DEFAULT_NA_STRING),
        pbRatio: getSafe(() => primaryCompanyPeerDataForSentiment.priceToBookValueRatio, DEFAULT_NA_STRING),
        dividendYield: getSafe(() => primaryCompanyPeerDataForSentiment.dividendYieldIndicatedAnnualDividend, DEFAULT_NA_STRING),
        roe: getSafe(() => primaryCompanyPeerDataForSentiment.returnOnAverageEquityTrailing12Month, DEFAULT_NA_STRING),
        executives,
        rawPeerCompanyList: peerList, // Keep raw for peer average calculation if needed, or transform for display
        peerCompaniesForDisplay: actualPeersForProfile, // A more structured list for display purposes if needed
    };
};

/**
 * Transforms the current price data for the stock.
 * Extracts NSE/BSE prices, day high/low, year high/low, and percentage change.
 * It prioritizes technical data for day high/low if available, falling back to currentPrice object.
 * @param {Object} rawStockData - The raw stock data object from the API.
 * @returns {Object} A structured current price data object.
 */
const transformCurrentPriceData = (rawStockData) => {
    return {
        nse: getSafe(() => rawStockData.currentPrice.NSE, DEFAULT_NA_STRING),
        bse: getSafe(() => rawStockData.currentPrice.BSE, DEFAULT_NA_STRING),
        dayHigh: getSafe(() => rawStockData.stockTechnicalData.find(d => d.label === "Day High")?.value, getSafe(() => rawStockData.currentPrice?.dayHigh, DEFAULT_NA_STRING)), // Prioritize technical data if available
        dayLow: getSafe(() => rawStockData.stockTechnicalData.find(d => d.label === "Day Low")?.value, getSafe(() => rawStockData.currentPrice?.dayLow, DEFAULT_NA_STRING)),
        yearHigh: getSafe(() => rawStockData.yearHigh, DEFAULT_NA_STRING),
        yearLow: getSafe(() => rawStockData.yearLow, DEFAULT_NA_STRING),
        percentChange: getSafe(() => rawStockData.percentChange, DEFAULT_NA_STRING),
    };
};

/**
 * Transforms raw technical indicator data into a structured object.
 * It maps known technical indicators (like SMAs) from an array of indicators
 * to a key-value pair object for easier access.
 * @param {Array<Object>} rawTechData - Array of raw technical data points from the API.
 * @returns {Object} A structured object of technical indicators.
 */
const transformTechnicalIndicators = (rawTechData) => {
    if (!rawTechData || !Array.isArray(rawTechData)) return {};
    const techIndicators = {};
    rawTechData.forEach(indicator => {
        // Example: map specific indicators if their labels are known and fixed
        // This part might need to be more robust based on actual labels from API
        // The API seems to use 'days' to identify SMAs for historical data fetch,
        // but for general technical data, it might use 'label'.
        if (indicator.label === "50 Day MA" || indicator.days === 50) { // Check both label and days
            techIndicators.sma50 = getSafe(() => indicator.nsePrice, DEFAULT_NA_STRING);
        }
        if (indicator.label === "100 Day MA" || indicator.days === 100) {
            techIndicators.sma100 = getSafe(() => indicator.nsePrice, DEFAULT_NA_STRING);
        }
        if (indicator.label === "150 Day MA" || indicator.days === 150) { // Corrected from 1500 to 150
            techIndicators.sma150 = getSafe(() => indicator.nsePrice, DEFAULT_NA_STRING);
        }
        if (indicator.label === "200 Day MA" || indicator.days === 200) {
            techIndicators.sma200 = getSafe(() => indicator.nsePrice, DEFAULT_NA_STRING);
        }
        // Add others as needed, e.g., dayHigh/dayLow are often here too (handled in currentPrice for now)
        // Other indicators like RSI, Bollinger Bands might need specific mapping based on their API representation.
    });
    return techIndicators;
};

/**
 * Transforms analyst sentiment data, primarily extracting the overall rating.
 * This data is usually derived from the primary company's entry within its own peer list.
 * @param {Object} primaryCompanyPeerData - The data object for the primary company, found within its peer list.
 * @returns {Object} A structured sentiment object.
 */
const transformAnalystSentiment = (primaryCompanyPeerData) => {
    return {
        overallRating: getSafe(() => primaryCompanyPeerData.overallRating, DEFAULT_NA_STRING),
        // Potentially more sentiment data if available
    };
};


/**
 * Main adapter function to transform the entire stock data API response.
 * It orchestrates various helper transformation functions to build a structured
 * data object for the application. It also handles the extraction and separation
 * of the primary company's data from its peer list for consistent metric display and peer analysis.
 * @param {Object} rawApiData - The complete raw response object from the stock data API.
 * @returns {Object|null} A structured object containing all relevant stock data, or null if input is invalid.
 */
export const transformStockDataApiResponse = (rawApiData) => {
  if (!rawApiData) {
    return null; // Or some default empty structure
  }

  // First, get primary company data from peer list, as it's used by other transformers (e.g., profile, sentiment).
  // This utility function (getPrimaryCompanyDataFromPeerList) is assumed to correctly identify the main company
  // within the `rawApiData.companyProfile.peerCompanyList` array.
  const primaryCompanyPeerData = getPrimaryCompanyDataFromPeerList(rawApiData, getSafe);
  
  // Prepare actualPeers (excluding the main company itself) for peer average calculations.
  // This filters out the main company from its own peer list to create a list of true peers.
  const allPeersRaw = getSafe(() => rawApiData.companyProfile.peerCompanyList, []);
  const nseCodeMain = getSafe(() => rawApiData.companyProfile.exchangeCodeNse, '').toUpperCase();
  const companyNameMainShort = getSafe(() => rawApiData.companyName, '@#NONE#@').split(' ')[0].toLowerCase(); // Using a unique placeholder for safety
  
  const actualPeers = allPeersRaw.filter(p => {
    const peerTickerId = getSafe(() => p.tickerId, '').toUpperCase(); // NSE code is often in tickerId for peers
    const peerCompanyNameShort = getSafe(() => p.companyName, '').split(' ')[0].toLowerCase();
    // Ensure the main company isn't included in its own list of "actual" peers for comparison.
    // Comparison by NSE code (if available) or by the first word of the company name.
    if (nseCodeMain && peerTickerId === nseCodeMain) return false;
    if (peerCompanyNameShort === companyNameMainShort && companyNameMainShort !== '@#none#@') return false; // Avoid issues if companyNameMainShort is empty
    return true;
  });

  const transformed = {
    // Keep some top-level raw data if it's simple and widely used, or transform it too
    id: getSafe(() => rawApiData.id, null), // Assuming an 'id' field exists, or use ISIN/symbol
    companyName: getSafe(() => rawApiData.companyName, DEFAULT_NA_STRING),
    
    // Transformed parts using dedicated helper functions
    companyProfile: transformCompanyProfile(rawApiData.companyProfile, rawApiData, primaryCompanyPeerData),
    currentPrice: transformCurrentPriceData(rawApiData),
    financialStatements: {
        yearly: transformFinancialStatements(rawApiData.financials), 
        // quarterly: transformFinancialStatements(rawApiData.quarterlyFinancials) // Placeholder if quarterly data is added
    },
    technicalIndicators: transformTechnicalIndicators(rawApiData.stockTechnicalData),
    analystSentiment: transformAnalystSentiment(primaryCompanyPeerData), // Uses the extracted primary company data

    // Data needed for peer averages, already processed and made available
    primaryCompanyPeerData, // This is the specific object for the main company found in its peer list (contains its own metrics like PE, PB, etc.)
    actualPeers, // This is the filtered list of *other* companies for averaging (market cap, PE, etc. of peers)

    // Retain any other direct fields from rawApiData if they are simple, don't need transformation,
    // and their structure is stable and directly usable by the application.
    // For example, if rawApiData.recentNews or rawApiData.shareHoldingPattern are used directly:
    news: getSafe(() => rawApiData.recentNews, []), // Assuming recentNews is an array
    shareHoldingPattern: getSafe(() => rawApiData.shareHoldingPattern, []), // Assuming shareHoldingPattern is structured as needed
  };

  return transformed;
}; 