# Stock Market Dashboard

**A comprehensive web application designed to provide users with detailed insights into Indian stock market data.**

This dashboard allows users to search for Indian stock symbols or company names and view a rich set of information including:
-   Real-time stock prices (NSE/BSE where available).
-   In-depth company profiles and operational overviews.
-   Key financial metrics and fundamental ratios (e.g., P/E, P/B, RoE, Debt-to-Equity).
-   Historical stock performance with interactive charts (price, volume, P/E ratio).
-   Technical analysis indicators (SMA, EMA, RSI, Bollinger Bands).
-   Peer company comparisons.
-   Recent news related to the selected stock.

The application leverages data primarily from the [indianapi.in](https://stock.indianapi.in) stock API.

<!-- Add a GIF or screenshot of the application in action here -->
<!-- e.g., ![Stock Market Dashboard Screenshot](link_to_your_screenshot.png) -->

## Table of Contents

- [Project Structure](#project-structure)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Backend Setup (`server/`)](#backend-setup-server)
- [Frontend Setup (`client/`)](#frontend-setup-client)
- [Environment Variables Overview](#environment-variables-overview)
- [API Key Management and Failover (Backend)](#api-key-management-and-failover-backend)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)
- [Potential Future Enhancements](#potential-future-enhancements)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Project Structure

The project is a monorepo composed of two main parts:

-   `client/`: A React-based single-page application (SPA) that serves as the user interface. It fetches data from the backend server and presents it in an interactive and user-friendly manner. For more client-specific details, see `client/README.md`.
-   `server/`: A Node.js (Express) backend server that acts as a secure proxy to the external `indianapi.in` API. It manages API key usage, implements a failover mechanism for API keys, and serves data to the frontend client.

## Features

-   **Stock Search:** Search for any Indian stock by symbol (e.g., "RELIANCE", "INFY") or company name.
-   **Company Details Tab:**
    -   Comprehensive company profile and business description.
    -   Overview including NSE/BSE symbols, ISIN, industry, and sector.
    -   List of key management personnel with their tenure.
    -   Recent news articles related to the company.
-   **Key Metrics Tab:**
    -   Extensive list of financial metrics categorized for clarity (Profitability, Valuation, Cash Flow, Financial Health, Efficiency, Growth, etc.).
    -   Collapsible sections for better navigation.
    -   Peer average comparisons for relevant metrics.
    -   Year-over-Year (YoY) growth figures.
    -   Tooltips explaining each metric.
    -   Peer companies table comparing key indicators.
-   **Historical Data Tab:**
    -   Interactive line and bar charts for historical performance.
    -   Selectable time periods (e.g., 1 month, 6 months, 1 year, 5 years).
    -   Selectable data filters (e.g., Price, Volume, P/E Ratio).
    -   Customized tooltips and axis formatting (Indian numbering system, volume units like Cr/L).
-   **Analysis Tab:**
    -   Display of key technical indicators:
        -   Simple Moving Averages (SMA - 20, 50, 200 day).
        -   Exponential Moving Averages (EMA - 20, 50, 200 day).
        -   Relative Strength Index (RSI - 14 day).
        -   Bollinger Bands (20 day, 2 std dev).
    -   Current price vs. MA/EMA indication (above/below).
    -   Overall technical sentiment signal (Bullish, Bearish, Neutral) based on a weighted scoring of indicators.
    -   List of contributing factors to the sentiment signal.
    -   Tooltips explaining each technical indicator.
-   **Responsive Design:** User interface adapts to different screen sizes.
-   **API Key Failover:** Backend server implements a failover mechanism for `indianapi.in` API keys to improve reliability.
-   **Animated Placeholders & UI Enhancements:** Includes features like animated search placeholders and a scroll-to-top button for improved user experience.

## Technology Stack

-   **Frontend (`client/`):**
    -   React (v18.x)
    -   JavaScript (ES6+)
    -   Chart.js (v3.x or v4.x) with `react-chartjs-2` for interactive charts.
    -   `chartjs-adapter-date-fns` for time-series chart scaling.
    -   CSS3 for styling.
-   **Backend (`server/`):**
    -   Node.js (typically latest LTS)
    -   Express.js (v4.x)
    -   Axios (for making HTTP requests to the external API)
    -   `dotenv` (for managing environment variables)
-   **Development Tools:**
    -   `nodemon` (for automatic server restarts during development)
    -   Create React App (for frontend project setup and scripts)

## Prerequisites

Before you begin, ensure you have the following installed:

-   **Node.js:** (LTS version recommended, e.g., v18.x or v20.x). You can download it from [nodejs.org](https://nodejs.org/).
-   **npm (Node Package Manager):** This comes bundled with Node.js.
-   **Git:** For cloning the repository and version control (optional if you download the code as a ZIP).

## Backend Setup (`server/`)

The backend server is crucial for fetching data securely and reliably.

1.  **Navigate to the `server` directory:**
    ```bash
    cd stock_market_dashboard/server
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Create and Configure `.env` File:**
    Create a file named `.env` in the `server/` directory. This file will store your API keys and other sensitive configurations.
    ```env
    # Port for the backend server
    PORT=5001

    # API Keys from indianapi.in
    # Obtain your API keys by registering at https://indianapi.in/
    # It is highly recommended to use at least a PRIMARY_API_KEY.
    # The BACKUP_API_KEY is optional but provides an essential failover mechanism
    # if the primary key encounters issues (e.g., rate limits, temporary suspension).
    PRIMARY_API_KEY=YOUR_PRIMARY_API_KEY_HERE
    BACKUP_API_KEY=YOUR_BACKUP_API_KEY_HERE # Optional, but recommended

    # MONGO_URI=YOUR_MONGO_CONNECTION_STRING (Optional: if you plan to enable MongoDB features for caching or other purposes)
    ```
    **Important:** Replace `YOUR_PRIMARY_API_KEY_HERE` and `YOUR_BACKUP_API_KEY_HERE` with your actual API keys obtained from [indianapi.in](https://stock.indianapi.in). Keep this file private and do not commit it to version control.
4.  **Start the Development Server:**
    -   For development with auto-restarting on file changes (recommended):
        ```bash
        npm run dev
        ```
    -   To run without nodemon:
        ```bash
        npm start
        ```
    The server will typically run on `http://localhost:5001` (or the port specified in your `.env` file). It provides an endpoint like `/api/stock?symbol=YOUR_SYMBOL` which the frontend uses.

## Frontend Setup (`client/`)

The frontend application renders the user interface and interacts with the backend. For more detailed client-specific information, refer to `stock_market_dashboard/client/README.md`.

1.  **Navigate to the `client` directory** (from the project root):
    ```bash
    cd stock_market_dashboard/client
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Ensure Backend is Running:** The client application expects the backend server to be running to fetch data. Make sure you have completed the backend setup and the server is active.
4.  **Start the React Development Server:**
    ```bash
    npm start
    ```
    The frontend application will typically open automatically in your browser at `http://localhost:3000`.

## Environment Variables Overview

### Server (`server/.env`)
-   `PORT`: The port on which the backend Express server will run. (Default: `5001`)
-   `PRIMARY_API_KEY`: **Required.** Your primary API key for `indianapi.in`.
-   `BACKUP_API_KEY`: **Optional, but highly recommended.** Your backup API key for `indianapi.in` for failover.
-   `MONGO_URI`: **Optional.** Connection string for MongoDB if you intend to use database features (e.g., for caching API responses, user data). This is not used by default.

### Client (`client/src/constants.js`)
It's important to understand how the client handles API-related constants:
-   `EXTERNAL_API_BASE_URL`: Defines the path to the backend endpoint for general stock data (e.g., `/api/stock`). This tells the client where to send its requests **to your backend server**.
-   `HISTORICAL_API_BASE_URL`: Similar to above, for historical data requests to your backend server.
-   **Regarding API Keys in Client Code:**
    The `client/src/constants.js` file may contain variables named `PRIMARY_API_KEY` and `BACKUP_API_KEY`. **These are strictly placeholders and should NOT be populated with your actual secret API keys.** The client application **does not and should not** make direct calls to the external `indianapi.in` service using these keys. All such external API calls are handled exclusively by the backend server, which securely manages the actual API keys from `server/.env`. The client-side constants are remnants from a potential direct-API-call architecture or for internal reference only and do not expose your secret keys if the backend proxy is used as intended.

## API Key Management and Failover (Backend)

The backend server (`server/server.js`) is designed to manage API keys securely and provide resilience:
-   It reads `PRIMARY_API_KEY` and `BACKUP_API_KEY` from the `server/.env` file.
-   When a request comes from the frontend to `/api/stock`:
    1.  It first attempts to use the `PRIMARY_API_KEY`.
    2.  If the primary key fails with specific errors (e.g., 401 Unauthorized, 403 Forbidden, 429 Too Many Requests), it automatically retries the request using the `BACKUP_API_KEY` (if configured and available).
    3.  This failover mechanism enhances the reliability of the data fetching process.
-   API keys are never exposed to the frontend client, ensuring they remain confidential.

## Available Scripts

### Server (`server/package.json`)
-   `npm start`: Starts the Node.js server using `node server.js`. Suitable for production or simple runs.
-   `npm run dev`: Starts the server using `nodemon server.js`. Ideal for development as it automatically restarts the server when file changes are detected in the `server/` directory.

### Client (`client/package.json`)
(For more details, see `client/README.md`)
-   `npm start`: Runs the React app in development mode. Opens `http://localhost:3000` in the browser and enables hot reloading.
-   `npm test`: Launches the test runner (Jest) in interactive watch mode.
-   `npm run build`: Builds the app for production into the `client/build` folder. It correctly bundles React in production mode and optimizes the build for the best performance.
-   `npm run eject`: **Advanced use.** Removes the single build dependency (react-scripts) from your project. This is a one-way operation.

## Deployment

Deploying this MERN-like stack (React frontend, Node/Express backend) involves a few common strategies:

1.  **Separate Deployments:**
    *   **Frontend (Client):** Build the React app using `npm run build` in the `client` directory. Deploy the static files from `client/build` to a static hosting service like Netlify, Vercel, GitHub Pages, AWS S3/CloudFront, etc.
    *   **Backend (Server):** Deploy the Node.js/Express server to a platform like Heroku, AWS Elastic Beanstalk, Google Cloud Run, DigitalOcean App Platform, or a traditional VPS. Ensure your `.env` file with API keys is securely configured on the server environment.
    *   **CORS Configuration:** If deploying to different domains, ensure your backend server's CORS policy (`app.use(cors())` in `server/server.js`) is configured to allow requests from your frontend's domain.

2.  **Combined Deployment (Serving Client from Backend):**
    *   Build the React app (`npm run build` in `client`).
    *   Configure the Express server to serve the static files from `client/build` for the root route and any client-side routes.
    *   The API routes (e.g., `/api/stock`) will be handled by the same Express server.
    *   This can simplify deployment to a single platform that supports Node.js applications.
    *   Example in `server/server.js` (add after API routes):
        ```javascript
        // Serve static assets from the React app in production
        if (process.env.NODE_ENV === 'production') {
          app.use(express.static('../client/build'));

          app.get('*', (req, res) => {
            res.sendFile(path.resolve(__dirname, '..', 'client', 'build', 'index.html'));
          });
        }
        ```
        (You would also need `const path = require('path');` at the top of `server.js`)

**Key Considerations for Production:**
-   **Environment Variables:** Never hardcode API keys or sensitive data. Use environment variables provided by your hosting platform for the backend.
-   **HTTPS:** Ensure your application is served over HTTPS.
-   **Error Handling & Logging:** Implement robust error handling and logging on the server.

## Potential Future Enhancements

-   **User Accounts:** Allow users to create accounts to save preferences or portfolios.
-   **Watchlist Feature:** Enable users to create and manage a watchlist of their favorite stocks.
-   **Advanced Charting:** Integrate more advanced charting features and technical indicators.
-   **Caching:** Implement server-side or client-side caching for API responses to reduce load and improve speed.
-   **Portfolio Tracking:** Allow users to input their stock holdings and track performance.
-   **Real-time Updates:** Use WebSockets for more real-time price updates (if supported by the API or an alternative source).
-   **More Data Sources:** Integrate additional APIs for broader data coverage or news sentiment analysis.
-   **UI/UX Theme Customization:** Allow users to switch between light/dark themes.

## Troubleshooting

-   **`npm install` fails:**
    -   Ensure you have Node.js and npm installed correctly (see Prerequisites).
    -   Try deleting `node_modules` and `package-lock.json` in the respective directory (`client/` or `server/`) and run `npm install` again.
    -   Check for network issues or npm registry problems.
-   **Server not starting:**
    -   Verify the `.env` file in `server/` is correctly configured, especially the `PORT`.
    -   Check the console for error messages. Another application might be using the same port.
-   **Client not connecting to server / "Error fetching stock data":**
    -   Ensure the backend server is running and accessible.
    -   The client expects the server at `http://localhost:5001` by default. If you changed the server port, ensure `client/src/constants.js` reflects this or that requests are proxied correctly.
    -   Verify your `PRIMARY_API_KEY` (and `BACKUP_API_KEY`) in `server/.env` are valid and have not exceeded rate limits from `indianapi.in`. The server console logs will show API call attempts and errors.
-   **Data not appearing or "N/A":**
    -   The `indianapi.in` API might not have data for the specific stock or metric.
    -   Check for errors in the browser's developer console and the server's console logs.

## Contributing

Contributions are welcome! If you have suggestions for improvements or find a bug, please feel free to:

1.  Open an issue to discuss the change or report the bug.
2.  Fork the repository and create a new branch for your feature or bug fix.
3.  Submit a pull request with a clear description of your changes.

## License

<!-- Specify your project's license here, e.g., MIT License -->
This project is currently unlicensed. Feel free to use the code as you see fit, but please consider providing attribution if you find it useful.

---

Happy Stalking! (Stock-ing, that is!) 📈 