import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  COMPANY_PROFILE_DESCRIPTION_MAX_LENGTH,
  KEY_MANAGEMENT_DISPLAY_COUNT,
  RECENT_NEWS_DISPLAY_COUNT
} from '../constants'; // Import display limits and other constants
import './News/NewsCard.css';
import './ExecutiveCard/ExecutiveCard.css';

/**
 * @file CompanyDetailsTab.js
 * 
 * @description This component renders the "Company Details" tab within the stock dashboard.
 * It displays key information about the selected company, including:
 *  - A detailed company profile description (with show more/less functionality).
 *  - An overview section with trading symbols (NSE/BSE), ISIN, industry, and sector.
 *  - A list of key management personnel with their titles and tenure.
 *  - A list of recent news articles related to the company.
 * It receives stock data and utility functions as props from the main App component.
 */

/**
 * Internal functional component for the Company Details Tab.
 * This component is wrapped with React.memo for performance optimization.
 * @param {object} props - The component's props.
 * @param {object} props.stockData - The main stock data object, containing company profile, executives, news, etc.
 * @param {boolean} props.isProfileExpanded - Boolean state indicating if the company profile description is expanded.
 * @param {function} props.toggleProfileExpanded - Function to toggle the profile description's expanded state.
 * @param {function} props.getSafe - Utility function to safely access nested object properties, returning a default if path is not found.
 * @param {function} props.calculateTenure - Utility function to calculate tenure from a date string.
 * @param {string} props.tabId - The ID of the tab.
 * @param {function} props.onContentLoaded - Function to call when content is loaded.
 */
const CompanyDetailsTabInternal = ({
  stockData,
  isProfileExpanded,
  toggleProfileExpanded,
  getSafe,
  calculateTenure,
  tabId,
  onContentLoaded,
}) => {
  // If no stock data is available (e.g., initial load or error), render nothing for this tab.
  // Note: Content loaded signal will be sent when stockData.companyProfile is available.

  useEffect(() => {
    if (stockData && stockData.companyProfile && onContentLoaded) {
      onContentLoaded(tabId);
    }
  }, [stockData, stockData?.companyProfile, tabId, onContentLoaded]);

  if (!stockData) return null;

  return (
    <div 
      id="panel-companyDetails" 
      role="tabpanel" 
      aria-labelledby="tab-companyDetails" 
      className="tab-panel company-details-tab-content cards-grid-area"
      // The `ref` for focus management and `tabIndex` are handled in App.js where this component is instantiated.
    >
      {/* Company Profile Section */}
      {/* Renders the company description, with logic to truncate long descriptions and provide a "Show more" / "Show less" button. */}
      {getSafe(() => stockData.companyProfile.description) !== 'N/A' && (
        <div className="card company-profile-desc">
          <h3>📄 Company Profile</h3>
          {(() => {
            const fullDescription = getSafe(() => stockData.companyProfile.description);
            // If description is long and not expanded, show truncated version and "Show more" button
            if (fullDescription.length > COMPANY_PROFILE_DESCRIPTION_MAX_LENGTH && !isProfileExpanded) {
              return (
                <>
                  <p className="description">{`${fullDescription.substring(0, COMPANY_PROFILE_DESCRIPTION_MAX_LENGTH)}...`}</p>
                  <button 
                    onClick={toggleProfileExpanded} 
                    className="card-internal-button view-more-less-button collapsed"
                  >
                    Show more
                  </button>
                </>
              );
            }
            // Otherwise, show full description and "Show less" button if applicable
            return (
              <>
                <p className="description">{fullDescription}</p>
                {fullDescription.length > COMPANY_PROFILE_DESCRIPTION_MAX_LENGTH && (
                  <button 
                    onClick={toggleProfileExpanded} 
                    className="card-internal-button view-more-less-button expanded"
                  >
                    Show less
                  </button>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* Company Overview Section */}
      {/* Displays key identifiers and classifications like trading symbols, ISIN, industry, and sector. */}
      {/* Includes a check to see if any overview data is present before rendering. */}
      <div className="card company-overview">
        <h3>ℹ️ Company Overview</h3>
        {(() => {
          const symbolNse = getSafe(() => stockData.companyProfile.symbolNse, 'N/A');
          const symbolBse = getSafe(() => stockData.companyProfile.symbolBse, 'N/A');
          const isin = getSafe(() => stockData.companyProfile.isin, 'N/A');
          const industry = getSafe(() => stockData.companyProfile.industry, 'N/A');
          const sector = getSafe(() => stockData.companyProfile.sector, 'N/A');

          // Check if any of the overview data points are available
          const hasAnyData = [
            symbolNse,
            symbolBse,
            isin,
            industry,
            sector,
          ].some(value => value !== 'N/A' && value !== '');

          if (!hasAnyData) {
            return <p className="no-data-message">No company overview information available.</p>;
          }

          // Render available overview details
          return (
            <>
              {symbolNse !== 'N/A' && <p><strong>Symbol (NSE):</strong> <span>{symbolNse}</span></p>}
              {symbolBse !== 'N/A' && <p><strong>Symbol (BSE):</strong> <span>{symbolBse}</span></p>}
              {isin !== 'N/A' && <p><strong>ISIN:</strong> <span>{isin}</span></p>}
              {industry !== 'N/A' && <p><strong>Industry:</strong> <span>{industry}</span></p>}
              {sector !== 'N/A' && <p><strong>Sector:</strong> <span>{sector}</span></p>}
            </>
          );
        })()}
      </div>

      {/* Key Management Section */}
      {/* Lists top executives, their titles, and calculated tenure. Limited by KEY_MANAGEMENT_DISPLAY_COUNT. */}
      {stockData.companyProfile && stockData.companyProfile.executives && (
        <div className="card officers-section">
          <h3>🧑‍💼 Key Management</h3>
          {getSafe(() => stockData.companyProfile.executives, []).length > 0 ? (
            getSafe(() => stockData.companyProfile.executives, []).slice(0, KEY_MANAGEMENT_DISPLAY_COUNT).map((executive, index) => {
              const name = getSafe(() => executive.name, 'N/A');
              const title = getSafe(() => executive.title, 'N/A');
              const tenure = calculateTenure(getSafe(() => executive.since, 'N/A'));
              return (
                <div key={index} className="executive-card">
                  <div className="executive-accent-bar"></div>
                  <div className="executive-details">
                    {title !== 'N/A' && <h4 className="executive-title">{title}</h4>}
                    {name && name !== 'N/A' && <p className="executive-name">{name}</p>}
                    {tenure !== 'N/A' && <p className="executive-tenure">Tenure: {tenure}</p>}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="no-data-message">No key management information available.</p>
          )}
        </div>
      )}

      {/* Recent News Section */}
      {/* Displays a list of recent news articles related to the stock, limited by RECENT_NEWS_DISPLAY_COUNT. */}
      {/* Includes logic to parse and format news publication dates. */}
      {stockData && stockData.news && (
      <div className="card recent-news-section">
          <h3>📰 Recent News</h3>
          {getSafe(() => stockData.news, []).length > 0 ? (
            <ul>
              {getSafe(() => stockData.news, []).slice(0, RECENT_NEWS_DISPLAY_COUNT).map((newsItem, index) => {
                const headline = getSafe(() => newsItem.headline || newsItem.title || newsItem.story, 'No headline');
                const link = getSafe(() => newsItem.link || newsItem.url, '#');
                let newsDateRaw = getSafe(() => newsItem.date, ''); 
                let formattedDate = '';

                // Attempt to parse and format the news date string. Handles various common date formats from APIs.
                if (newsDateRaw && typeof newsDateRaw === 'string') {
                  try {
                    let parsableDateString = newsDateRaw;
                    // Remove day name prefix if present (e.g., "Mon, DD Mon YYYY...")
                    const commaIndex = parsableDateString.indexOf(',');
                    if (commaIndex !== -1) {
                      parsableDateString = parsableDateString.substring(commaIndex + 1).trimStart(); 
                    }
                    // Remove trailing "IST" or "IST IST" common in Indian API date strings.
                    if (parsableDateString.endsWith(' IST IST')) {
                      parsableDateString = parsableDateString.substring(0, parsableDateString.length - ' IST IST'.length);
                    } else if (parsableDateString.endsWith(' IST')) {
                      parsableDateString = parsableDateString.substring(0, parsableDateString.length - ' IST'.length);
                    }
                    parsableDateString = parsableDateString.trimEnd(); // General trim for any remaining whitespace
                    
                    // Regex to parse dates in formats like "DD Mon YYYY HH:MM AM/PM" or "D Mon YYYY H:MM AM/PM"
                    const parts = parsableDateString.match(/(\d{1,2})\s+(\w+)\s+(\d{4})\s+(\d{1,2}):(\d{2})\s+(AM|PM)/i);
                    
                    if (parts) {
                      const day = parseInt(parts[1], 10);
                      const monthName = parts[2]; // Month name (e.g., "Jan", "Feb")
                      const year = parseInt(parts[3], 10);
                      let hours = parseInt(parts[4], 10);
                      const minutes = parseInt(parts[5], 10);
                      const ampm = parts[6].toUpperCase(); // AM/PM indicator

                      // Map month names (first 3 letters) to zero-based month index for Date object.
                      const monthMap = { JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5, JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11 };
                      const monthIndex = monthMap[monthName.toUpperCase().substring(0,3)];

                      if (monthIndex !== undefined) {
                        // Adjust hours for 12-hour AM/PM format to 24-hour format.
                        if (ampm === 'PM' && hours < 12) hours += 12; // PM hours (1-11 PM) add 12
                        if (ampm === 'AM' && hours === 12) hours = 0; // Midnight (12 AM) becomes 00 hours

                        const dateObj = new Date(year, monthIndex, day, hours, minutes);
                        // Check if the constructed Date object is valid.
                        if (!isNaN(dateObj.getTime())) {
                          // Format the valid date to a user-friendly string (e.g., "Jan 1, 2023").
                          formattedDate = dateObj.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          });
                        }
                      }
                    } 
                    // If regex doesn't match or month is invalid, formattedDate remains empty, effectively hiding an unparseable date.
                  } catch (e) {
                    // Catch any unexpected errors during date parsing; formattedDate will remain empty.
                    // console.error("Error parsing news date:", newsDateRaw, e); // Optional: log for debugging
                  }
                }

                return (
                  <li key={index} className="news-item-wrapper"> 
                    <div className="news-article-card">
                      <div className="news-content">
                        {link !== '#' ? 
                          <a href={link} target="_blank" rel="noopener noreferrer" className="news-headline-link">
                              {headline}
                              {/* Consider adding an external link icon here if desired */}
                          </a> :
                          <span className="news-headline-text">{headline}</span>
                        }
                        {formattedDate && <p className="news-item-date-wrapper"><span className="news-item-date">{formattedDate}</span></p>}
                        {/* Placeholder for news summary if available in the future */}
                        {/* newsItem.summary && <p className="news-summary">{newsItem.summary}</p> */}
                      </div>
                    </div>
                  </li>
                );
              })}
          </ul>
          ) : (
            <p className="no-data-message">No recent news available for this stock.</p>
          )}
        </div>
      )}
    </div>
  );
};

// PropTypes for type checking and documentation
CompanyDetailsTabInternal.propTypes = {
  /** The main stock data object from App.js (transformed by apiAdapter) */
  stockData: PropTypes.object, 
  /** Boolean state from App.js indicating if the company profile description is expanded */
  isProfileExpanded: PropTypes.bool.isRequired,
  /** Function from App.js to toggle the profile description expansion */
  toggleProfileExpanded: PropTypes.func.isRequired,
  /** Utility function to safely access nested object properties */
  getSafe: PropTypes.func.isRequired,
  /** Utility function to calculate tenure from a date string */
  calculateTenure: PropTypes.func.isRequired,
  /** The ID of the tab */
  tabId: PropTypes.string.isRequired,
  /** Function to call when content is loaded */
  onContentLoaded: PropTypes.func.isRequired,
};

// Default props for the component
CompanyDetailsTabInternal.defaultProps = {
  stockData: null, 
  isProfileExpanded: false,
};

// Display name for React DevTools
CompanyDetailsTabInternal.displayName = 'CompanyDetailsTab';

// Memoize the CompanyDetailsTab component using React.memo.
// This prevents the component from re-rendering if its props (stockData, isProfileExpanded, etc.)
// have not changed, which can be a significant performance optimization for complex tabs.
const CompanyDetailsTab = React.memo(CompanyDetailsTabInternal);

export default CompanyDetailsTab; 