/**
 * @file apiUtils.js
 * @description Utilities for making API calls, including fallback mechanisms.
 */

/**
 * Fetches data from a given URL, trying a primary API key first, then a backup if the primary fails.
 * @param {string} url The URL to fetch data from.
 * @param {string} primaryApiKey The primary API key.
 * @param {string} backupApiKey The backup API key (can be null or undefined).
 * @param {string} primaryKeyName A descriptive name for the primary key (e.g., 'Primary') for error messages.
 * @param {string} backupKeyName A descriptive name for the backup key (e.g., 'Backup') for error messages.
 * @param {string} primaryKeyPlaceholder The placeholder value for the primary API key.
 * @param {string} backupKeyPlaceholder The placeholder value for the backup API key.
 * @returns {Promise<any>} A promise that resolves with the JSON data if successful.
 * @throws {Error} Throws an error if fetching fails with all available keys or if keys are not configured.
 */
export async function fetchDataWithFallback(
  url,
  primaryApiKey,
  backupApiKey,
  primaryKeyName = 'Primary',
  backupKeyName = 'Backup',
  primaryKeyPlaceholder = 'YOUR_PRIMARY_API_KEY_HERE', // Default placeholder
  backupKeyPlaceholder = 'YOUR_BACKUP_API_KEY_HERE' // Default placeholder
) {
  const attemptFetchWithKey = async (apiKey, keyName) => {
    const response = await fetch(url, {
      headers: { 'X-API-Key': apiKey },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})); // Try to parse error, default to empty obj
      const errorMessage = errorData.message || errorData.detail || errorData.details || `Error: ${response.status} with ${keyName} key`;
      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }
    return response.json();
  };

  // Try with Primary API Key
  if (!primaryApiKey || primaryApiKey === primaryKeyPlaceholder) {
    throw new Error(`${primaryKeyName} API Key is not configured or is set to the placeholder value.`);
  }

  try {
    // console.log(`Attempting fetch with ${primaryKeyName} key for URL: ${url}`);
    return await attemptFetchWithKey(primaryApiKey, primaryKeyName);
  } catch (primaryError) {
    // console.error(`${primaryKeyName} API Key failed for URL ${url}:`, primaryError.message, "Status:", primaryError.status);
    // Check if a backup key is available and the error is a candidate for retry (e.g., auth, quota)
    if (backupApiKey && backupApiKey !== backupKeyPlaceholder && (primaryError.status === 401 || primaryError.status === 403 || primaryError.status === 429)) {
      // console.log(`Trying ${backupKeyName} API Key for URL: ${url}...`);
      try {
        return await attemptFetchWithKey(backupApiKey, backupKeyName);
      } catch (backupError) {
        // console.error(`${backupKeyName} API Key also failed for URL ${url}:`, backupError.message, "Status:", backupError.status);
        // Combine error messages or throw a more specific one
        throw new Error(`${primaryKeyName} Key Error: ${primaryError.message}. ${backupKeyName} Key Error: ${backupError.message}`);
      }
    } else {
      // If no backup key or error is not retryable, re-throw the primary error
      throw primaryError;
    }
  }
} 