import { useMemo } from 'react';
import {
    DEFAULT_NA_STRING, // This was unused but is actually used, re-adding
    // Assuming these are correctly pathed if they are used by the metric calcs directly inside this hook.
    // However, the original App.js passes memoized versions of these from App.js scope.
    // For this hook, it's better to receive these calculation functions as parameters for better testability and decoupling.
} from '../utils';

/**
 * @file useCategorizedMetrics.js
 * @description Custom hook for calculating and managing categorized financial metrics using useMemo.
 */
function useCategorizedMetrics(
    stockData,
    // Pass all necessary memoized calculation functions as arguments
    memoizedGetSafe,
    memoizedFindFinancialByYear,
    memoizedFormatToCrores,
    memoizedFormatPercentage,
    memoizedFormatRatio,
    memoizedFormatCurrency,
    memoizedCalculateYoYGrowth,
    memoizedCalculateCAGR,
    memoizedCalculateProfitabilityMetrics,
    memoizedCalculateValuationMetrics,
    memoizedCalculateCashFlowHealthMetrics,
    memoizedCalculateAdvancedCashFlowInsights,
    memoizedCalculateFinancialHealthAndDebtMetrics,
    memoizedCalculateAssetQualityInsights,
    memoizedCalculateShareholderReturnsMetrics,
    memoizedCalculateShareCapitalInsights,
    memoizedCalculateEfficiencyRatios,
    memoizedCalculateOperationalEfficiencyMetrics,
    memoizedCalculateGrowthTrendsMetrics,
    memoizedCalculateHistoricalPerformanceMetrics,
    memoizedCalculateLiquidityRatios,
    memoizedCalculateKeyTechnicalIndicators, // This was in App.js's categorizedMetrics, ensure it's still desired here or separate
    memoizedCalculateOverallSentimentMetrics,
    memoizedCalculatePeerAverage,
    memoizedGetPeerComparisonDetails
) {
    const categorizedMetrics = useMemo(() => {
        if (stockData && stockData.financialStatements && stockData.financialStatements.yearly && stockData.companyProfile && stockData.currentPrice && stockData.technicalIndicators && stockData.primaryCompanyPeerData && stockData.actualPeers) {
            const metrics = {};
            const yearlyFinancialData = stockData.financialStatements.yearly;
            const financialsPreviousYear = yearlyFinancialData.length > 1 ? memoizedGetSafe(() => yearlyFinancialData[1]) : null;

            const primaryCompanyDataForMetrics = stockData.primaryCompanyPeerData;
            const actualPeersForAverage = stockData.actualPeers;

            const avgPeerMarketCap = memoizedCalculatePeerAverage(actualPeersForAverage, 'marketCap', memoizedFormatToCrores);
            const avgPeerPE = memoizedCalculatePeerAverage(actualPeersForAverage, 'priceToEarningsValueRatio', memoizedFormatRatio);
            const avgPeerPB = memoizedCalculatePeerAverage(actualPeersForAverage, 'priceToBookValueRatio', memoizedFormatRatio);
            const avgPeerDivYield = memoizedCalculatePeerAverage(actualPeersForAverage, 'dividendYieldIndicatedAnnualDividend', memoizedFormatPercentage);
            const avgPeerRoE = memoizedCalculatePeerAverage(actualPeersForAverage, 'returnOnAverageEquityTrailing12Month', memoizedFormatPercentage);

            const { metrics: profitabilityMetricsData, netIncomeRaw } = memoizedCalculateProfitabilityMetrics(
                yearlyFinancialData,
                memoizedFindFinancialByYear,
                memoizedFormatToCrores,
                memoizedFormatPercentage
            );
            metrics.profitability = profitabilityMetricsData;

            const { metrics: valuationMetricsData, goodwillNetRaw, intangiblesNetRaw, nsePriceRaw } = memoizedCalculateValuationMetrics(
                stockData.currentPrice,
                primaryCompanyDataForMetrics,
                yearlyFinancialData,
                memoizedFindFinancialByYear,
                memoizedFormatRatio,
                memoizedFormatToCrores,
                memoizedFormatCurrency,
                memoizedGetPeerComparisonDetails,
                avgPeerPE,
                avgPeerPB,
                avgPeerMarketCap
            );
            metrics.valuation = valuationMetricsData;

            if (netIncomeRaw !== undefined) {
                const { metrics: cashFlowHealthMetricsData } = memoizedCalculateCashFlowHealthMetrics(
                    yearlyFinancialData,
                    netIncomeRaw,
                    memoizedFindFinancialByYear,
                    memoizedFormatToCrores,
                    memoizedFormatRatio
                );
                metrics.cashFlowHealth = cashFlowHealthMetricsData;
            } else {
                metrics.cashFlowHealth = {};
            }
            
            const { metrics: advancedCashFlowMetricsData, interestPaidCASRaw } = memoizedCalculateAdvancedCashFlowInsights(
                yearlyFinancialData,
                memoizedFindFinancialByYear,
                memoizedFormatToCrores
            );
            metrics.advancedCashFlow = advancedCashFlowMetricsData;

            let tangibleBookValuePerShareRawFromMetrics;

            if (interestPaidCASRaw !== undefined) {
                const { metrics: financialHealthDebtMetricsData, totalAssetsBALRaw, tangibleBookValuePerShareRaw, totalEquityRaw } = memoizedCalculateFinancialHealthAndDebtMetrics(
                    yearlyFinancialData,
                    interestPaidCASRaw,
                    memoizedFindFinancialByYear,
                    memoizedFormatToCrores,
                    memoizedFormatRatio,
                    memoizedFormatCurrency
                );
                metrics.financialHealthDebt = financialHealthDebtMetricsData;
                tangibleBookValuePerShareRawFromMetrics = tangibleBookValuePerShareRaw;

                if (totalAssetsBALRaw !== undefined && goodwillNetRaw !== undefined && intangiblesNetRaw !== undefined) {
                    const { metrics: assetQualityMetricsData } = memoizedCalculateAssetQualityInsights(
                        totalAssetsBALRaw,
                        goodwillNetRaw,
                        intangiblesNetRaw,
                        memoizedFormatPercentage
                    );
                    metrics.assetQuality = assetQualityMetricsData;
                } else {
                    metrics.assetQuality = {};
                }

                if (netIncomeRaw !== undefined && totalAssetsBALRaw !== undefined) {
                     const { metrics: efficiencyRatiosData } = memoizedCalculateEfficiencyRatios(
                        primaryCompanyDataForMetrics,
                        netIncomeRaw,       
                        totalAssetsBALRaw,  
                        avgPeerRoE,         
                        memoizedFormatPercentage,
                        memoizedGetPeerComparisonDetails
                    );
                    metrics.efficiencyRatios = efficiencyRatiosData;
                } else {
                    metrics.efficiencyRatios = {};
                }

                if (totalEquityRaw !== undefined) {
                    const { metrics: shareCapitalMetricsData } = memoizedCalculateShareCapitalInsights(
                        yearlyFinancialData,
                        totalEquityRaw, 
                        memoizedFindFinancialByYear,
                        memoizedFormatCurrency
                    );
                    metrics.shareCapital = shareCapitalMetricsData;
                }
                 else {
                    metrics.shareCapital = {};
                }

            } else {
                metrics.financialHealthDebt = {};
                metrics.assetQuality = {};
                metrics.shareCapital = {};
                metrics.efficiencyRatios = {};
                tangibleBookValuePerShareRawFromMetrics = undefined;
            }

            const { metrics: shareholderReturnsMetricsData, epsDilutedCurrentYoY } = memoizedCalculateShareholderReturnsMetrics(
                yearlyFinancialData,
                primaryCompanyDataForMetrics,
                avgPeerDivYield,
                memoizedFindFinancialByYear,
                memoizedFormatCurrency,
                memoizedFormatPercentage,
                memoizedGetPeerComparisonDetails
            );
            metrics.shareholderReturns = shareholderReturnsMetricsData;

            if (financialsPreviousYear) {
                const { metrics: operationalEfficiencyData } = memoizedCalculateOperationalEfficiencyMetrics(
                    yearlyFinancialData,
                    financialsPreviousYear,
                    memoizedFindFinancialByYear,
                    memoizedFormatToCrores,
                    memoizedCalculateYoYGrowth
                );
                metrics.operationalEfficiency = operationalEfficiencyData;
            } else {
                metrics.operationalEfficiency = {};
            }

            const tangibleBookValuePerShareRawForGrowth = tangibleBookValuePerShareRawFromMetrics;

            if (financialsPreviousYear && netIncomeRaw !== undefined && epsDilutedCurrentYoY !== undefined && tangibleBookValuePerShareRawForGrowth !== undefined) {
                const { metrics: growthTrendsData } = memoizedCalculateGrowthTrendsMetrics(
                    yearlyFinancialData,
                    financialsPreviousYear,
                    netIncomeRaw,
                    epsDilutedCurrentYoY,
                    tangibleBookValuePerShareRawForGrowth, 
                    memoizedFindFinancialByYear,
                    memoizedCalculateYoYGrowth
                );
                metrics.growthTrends = growthTrendsData;
            } else {
                 metrics.growthTrends = {};
            }
            
            const { metrics: historicalPerformanceData } = memoizedCalculateHistoricalPerformanceMetrics(
                yearlyFinancialData,
                memoizedFindFinancialByYear,
                memoizedCalculateCAGR
            );
            metrics.historicalPerformance = historicalPerformanceData;
            
            const { metrics: liquidityData } = memoizedCalculateLiquidityRatios(
                yearlyFinancialData,
                memoizedFindFinancialByYear,
                memoizedFormatToCrores,
                memoizedFormatRatio
            );
            metrics.liquidity = liquidityData;

            const numericNsePrice = parseFloat(nsePriceRaw);
            if (nsePriceRaw !== undefined) {
                metrics.technicalData = memoizedCalculateKeyTechnicalIndicators(
                    stockData, 
                    isNaN(numericNsePrice) ? DEFAULT_NA_STRING : numericNsePrice,
                    memoizedFormatCurrency,
                    memoizedFormatPercentage
                );
            } else {
                metrics.technicalData = {};
            }

            metrics.overallSentiment = memoizedCalculateOverallSentimentMetrics(
                stockData.analystSentiment
            );

            return metrics;
        }
        return {};
    }, [
        stockData, memoizedGetSafe, memoizedFindFinancialByYear, memoizedFormatToCrores, memoizedFormatPercentage, memoizedFormatRatio, memoizedFormatCurrency,
        memoizedCalculateYoYGrowth, memoizedCalculateCAGR,
        memoizedCalculateProfitabilityMetrics, memoizedCalculateValuationMetrics, memoizedCalculateCashFlowHealthMetrics,
        memoizedCalculateAdvancedCashFlowInsights, memoizedCalculateFinancialHealthAndDebtMetrics,
        memoizedCalculateAssetQualityInsights, memoizedCalculateShareholderReturnsMetrics, memoizedCalculateShareCapitalInsights,
        memoizedCalculateEfficiencyRatios, memoizedCalculateOperationalEfficiencyMetrics, memoizedCalculateGrowthTrendsMetrics,
        memoizedCalculateHistoricalPerformanceMetrics, memoizedCalculateLiquidityRatios,
        memoizedCalculateKeyTechnicalIndicators, memoizedCalculateOverallSentimentMetrics,
        memoizedCalculatePeerAverage, memoizedGetPeerComparisonDetails
    ]);

    return categorizedMetrics;
}

export default useCategorizedMetrics; 