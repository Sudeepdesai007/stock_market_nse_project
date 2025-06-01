// API Configuration: Base URLs and Keys for accessing stock market data.
// IMPORTANT: For production, these API keys should be moved to environment variables
// and not hardcoded in the source. Refer to the README for initial setup.
export const EXTERNAL_API_BASE_URL = 'https://stock.indianapi.in/stock';
export const HISTORICAL_API_BASE_URL = 'https://stock.indianapi.in/historical_data';
export const PRIMARY_API_KEY = 'sk-live-15i6VWdMESf2YLQU1dGSV6PxuLdRPWzNycs2stx9';
export const BACKUP_API_KEY = 'sk-live-a5Dc4nJRfs2CYF2WQiaIjLVl0szju43jFkfXCzVr';

// UI Display Limits: Constants controlling the number of items or length of text displayed in various UI sections.
export const COMPANY_PROFILE_DESCRIPTION_MAX_LENGTH = 500;
export const PEER_COMPANIES_DISPLAY_COUNT = 10;
export const KEY_MANAGEMENT_DISPLAY_COUNT = 5;
export const RECENT_NEWS_DISPLAY_COUNT = 5;
export const INITIAL_METRICS_DISPLAY_COUNT = 7;

// Historical Data Configuration: Defines available periods and filters for historical data charts.
export const HISTORICAL_PERIODS = ['1m', '6m', '1yr', '3yr', '5yr', '10yr', 'max'];
export const HISTORICAL_FILTERS = ['default', 'price', 'pe', 'sm', 'evebitda', 'ptb', 'mcs'];

// Search Bar Animation: Configuration for the animated placeholder text in the search input.
export const PLACEHOLDER_TEXTS = [
  "Enter Stock Name (e.g., Tata Steel)",
  "Search for 'Reliance Industries'...",
  "Try 'INFY' or 'SBIN'...",
  "What company are you looking for?"
];
export const TYPING_SPEED = 40;
export const DELETING_SPEED = 25;
export const HOLD_DURATION = 1500;

export const DEBUG_MODE = false; // Enables extensive logging and raw data display 