/**
 * @file server.js
 * @description Backend server for the Indian Stock Market Dashboard.
 * This server acts as a proxy to an external stock API to protect API keys 
 * and implement a failover mechanism for multiple API keys.
 * It uses Express.js and supports fetching stock data for a given symbol.
 */

require('dotenv').config(); // Load environment variables from .env file into process.env
const express = require('express');
const cors = require('cors');
// const mongoose = require('mongoose'); // MongoDB ODM, commented out as not currently in use.
const axios = require('axios'); // HTTP client for making API requests

const app = express(); // Initialize Express application
const PORT = process.env.PORT || 5001; // Define the port for the server, fallback to 5001

// === Middleware ===
app.use(cors()); // Enable Cross-Origin Resource Sharing for all routes
app.use(express.json()); // Parse incoming JSON requests

// === MongoDB Connection (Optional) ===
// This section is commented out. If MongoDB is to be used in the future for caching
// or storing user data, uncomment and configure this section.
// const MONGO_URI = process.env.MONGO_URI;
// mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => console.error('MongoDB connection error:', err));

// === API Configuration ===
// Load API keys from environment variables. Supports a primary and a backup key.
// Filters out any keys that are not defined in the .env file.
const API_KEYS = [
  process.env.PRIMARY_API_KEY, 
  process.env.BACKUP_API_KEY   
].filter(key => !!key); // Ensures only defined keys are in the array

// Base URL for the external stock API
const BASE_URL = 'https://stock.indianapi.in';

// === Routes ===

/**
 * Root route for health check.
 * Responds with a simple message indicating the backend is running.
 */
app.get('/', (req, res) => {
  res.send('Stock Market API Backend is running!');
});

/**
 * Makes a single API call to the external stock service using a provided symbol and API key.
 * @async
 * @param {string} symbol - The stock symbol (e.g., "RELIANCE").
 * @param {string} apiKey - The API key to use for the request.
 * @returns {Promise<object>} A promise that resolves with the Axios response object on success.
 * @throws {Error} Throws an error if the API call fails (Axios error object).
 */
const makeApiCall = async (symbol, apiKey) => {
  return axios.get(`${BASE_URL}/stock`, {
    params: {
      name: symbol.toUpperCase(), // Ensure symbol is uppercase as expected by external API
    },
    headers: {
      'X-API-Key': apiKey // Pass the API key in the X-API-Key header
    }
  });
};

/**
 * Fetches stock data from the external API with an API key failover mechanism.
 * It iterates through the configured API_KEYS (primary, then backup if available).
 * If a call fails with an auth/rate-limit error (401, 403, 429), it tries the next key.
 * For other errors, or if all keys fail, it throws an error.
 * @async
 * @param {string} symbol - The stock symbol to fetch data for.
 * @returns {Promise<object>} A promise that resolves with the stock data from the API on success.
 * @throws {Error} Throws a custom error if all API keys fail or a non-retryable error occurs.
 *                 The error object will have `status` and `details` properties for HTTP errors.
 */
const fetchStockDataWithFailover = async (symbol) => {
  let lastError = null; // Store the last encountered error for final error reporting

  // Iterate through the available API keys
  for (let i = 0; i < API_KEYS.length; i++) {
    const currentApiKey = API_KEYS[i];
    const keyName = i === 0 ? 'PRIMARY' : 'BACKUP'; // For logging purposes

    try {
      console.log(`Attempting API call for ${symbol} with ${keyName} key (index ${i})`);
      const response = await makeApiCall(symbol, currentApiKey);
      return response.data; // Success: return the data from the API response
    } catch (error) {
      lastError = error; // Store the error
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error(`API call with ${keyName} key failed. Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
        // Check for specific error statuses that warrant trying the next key (auth issues, rate limits)
        if (error.response.status === 401 || error.response.status === 403 || error.response.status === 429) {
          console.log(`${keyName} key likely invalid or rate-limited. Trying next key if available.`);
          // Continue to the next iteration of the loop to try the next key
        } else {
          // For other HTTP errors (e.g., 500 from external API, 404 not found), these are not key-related issues.
          // Re-throw the error immediately to be caught by the route handler. No need to try other keys.
          console.log(`${keyName} key failed with non-retryable HTTP error ${error.response.status}. Failing fast.`);
          throw error; 
        }
      } else {
        // Something happened in setting up the request that triggered an Error (e.g., network error, DNS issue)
        console.error(`${keyName} key failed without a response object (e.g., network error): ${error.message}. Failing fast.`);
        throw error; // Re-throw for the main route handler to catch
      }
    }
  }

  // If the loop completes, it means all API keys were tried and failed with retryable errors (401/403/429)
  console.error('All API keys failed or were exhausted for symbol:', symbol);
  let finalError;
  if (lastError && lastError.response) {
    // This should be a 401, 403, or 429 error from the last attempt
    finalError = new Error(`All API keys failed or were rate-limited. Last error: ${lastError.response.status} - ${lastError.response.data?.message || 'External API authentication or rate limit issue'}`);
    finalError.status = lastError.response.status; // Propagate status for client response
    finalError.details = lastError.response.data; // Propagate details
  } else if (lastError) {
    // Fallback for unexpected errors if lastError doesn't have a response object (should be rare with current logic)
    finalError = new Error(lastError.message || 'All API keys failed due to an unexpected issue during iteration.');
    finalError.status = lastError.status || 500; 
    finalError.details = lastError.data || { message: lastError.message };
  } else {
    // This case should ideally not be reached if API_KEYS array has items.
    // It might occur if API_KEYS was empty initially and the loop never ran.
    finalError = new Error('Failed to fetch data: No API keys were attempted or an unknown error occurred.');
    finalError.status = 500;
    finalError.details = { message: 'No API keys available or unknown issue.' };
  }
  throw finalError; // Throw the consolidated error
};

/**
 * GET /api/stock
 * Route to fetch stock data for a given symbol.
 * Expects a 'symbol' query parameter (e.g., /api/stock?symbol=RELIANCE).
 * Uses `fetchStockDataWithFailover` to handle API calls and key rotation.
 */
app.get('/api/stock', async (req, res) => {
  const { symbol } = req.query; // Extract stock symbol from query parameters

  // Validate that the symbol parameter is provided
  if (!symbol) {
    return res.status(400).json({ message: 'Stock symbol (name) is required' });
  }

  // Check if any API keys are configured on the server
  if (API_KEYS.length === 0) {
    console.error('Server Error: No API keys configured. Ensure PRIMARY_API_KEY and/or BACKUP_API_KEY are set in .env');
    return res.status(500).json({ message: 'Server configuration error: No API keys available.' });
  }

  try {
    // Attempt to fetch stock data using the failover logic
    const data = await fetchStockDataWithFailover(symbol);
    res.json(data); // Send successful data response to the client
  } catch (error) {
    // Handle errors thrown by fetchStockDataWithFailover or other unexpected errors
    const status = error.status || (error.response ? error.response.status : 500); // Determine HTTP status code
    const message = error.message || 'Error fetching stock data from external API after failover';
    // error.details should come from our custom error in fetchStockDataWithFailover,
    // error.response.data would be from an Axios error not caught and refined by failover logic (should be rare).
    const details = error.details || (error.response ? error.response.data : { originalMessage: error.message });

    console.error(`Error in /api/stock for symbol '${symbol}' - Status: ${status}, Message: ${message}`);
    if (details && Object.keys(details).length > 0) { // Log details if they exist and are not empty
        console.error(`Error in /api/stock for symbol '${symbol}' - Details: ${JSON.stringify(details, null, 2)}`);
    }

    // Send error response to the client
    res.status(status).json({ message, details });
  }
});

// Start the server and listen on the defined PORT
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 