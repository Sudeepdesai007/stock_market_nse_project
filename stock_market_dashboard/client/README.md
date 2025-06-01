# Indian Stock Market Dashboard - Client Application

## Purpose of This README

This document provides detailed information specifically for the **React-based client application** of the Indian Stock Market Dashboard. It covers client-side features, technology stack, setup instructions for running the client, its internal project structure, and available scripts.

For a **full project overview, backend server setup, API key configuration, deployment considerations, and contribution guidelines**, please refer to the [**main project README located at the project root (`../../README.md`)**](../../README.md).

The client application is responsible for rendering the user interface, allowing users to search for stock symbols, and displaying comprehensive data including company profiles, key financial metrics, historical performance charts, and technical analysis. It fetches all its data from the project's backend server.

## Features (Client-Side Focus)

*   **Interactive User Interface**: Built with React for a dynamic and responsive experience.
*   **Stock Data by Symbol**: Users can search for stock symbols to fetch and display detailed information.
*   **Tabbed Navigation**: Data is organized into logical tabs:
    *   **Company Details**: Profile, overview, management, and news.
    *   **Key Metrics**: Categorized financial metrics with peer comparisons and YoY growth.
    *   **Historical Data**: Interactive charts (Price, Volume) via Chart.js.
    *   **Technical Analysis**: SMAs, EMAs, RSI, Bollinger Bands, and an overall sentiment signal.
*   **UI Enhancements**:
    *   Modern dark theme.
    *   Responsive design for various screen sizes.
    *   Tooltips for metrics and indicators.
    *   Loading spinners and error messages.
    *   Animated search placeholder and scroll-to-top button.
*   **Data Handling**:
    *   Client-side adaptation of API data (received from the backend) via `apiAdapter.js`.
    *   Utility functions in `utils.js` for complex calculations and formatting performed on the client-side.

## Tech Stack (Client)

*   **Core**: React.js (v18.x)
*   **Charting**: Chart.js (with `react-chartjs-2` wrapper)
*   **Date Utility for Charts**: `chartjs-adapter-date-fns`
*   **Styling**: CSS (with CSS Variables for theming and BEM-like conventions in places)
*   **Language**: JavaScript (ES6+)
*   **Package Manager**: npm
*   **Development Environment**: Create React App (providing scripts for starting, testing, and building)

## Setup and Running the Client

### Prerequisites

*   Node.js (v14.x or later recommended – check the version used by Create React App for best compatibility).
*   npm (usually comes with Node.js).
*   **Backend Server Running**: The client application requires the backend server (located in `stock_market_dashboard/server/`) to be operational and correctly configured with the necessary API keys. Please follow the setup instructions in the [main project README](../../README.md) before proceeding with the client setup.

### Installation

1.  From the **project root** (`stock_market_dashboard/`), navigate to the client directory:
    ```bash
    cd client
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```

### Running the Development Server

1.  Ensure the backend server is running (as per the main project README).
2.  Once client dependencies are installed, and while you are in the `stock_market_dashboard/client/` directory, start the React development server:
    ```bash
    npm start
    ```
3.  Open your browser and navigate to [http://localhost:3000](http://localhost:3000) (or the port indicated in your console if 3000 is in use) to view the application.

The page will reload automatically when you make changes to the code. Lint errors, if any, will be shown in the console. The client is configured to make requests to the local backend server (e.g., `http://localhost:5001/api/stock`) to fetch stock data.

## Project Structure (`client/`)

An overview of the client application's directory structure:

*   **`public/`**: Contains the main HTML file (`index.html`), favicon, `manifest.json` (for PWA capabilities), and other static assets. This is the entry point served by the development server.
*   **`src/`**: Contains all the dynamic JavaScript code and React components.
    *   **`App.js`**: The root application component. It manages the overall layout, state (like current symbol, fetched data, active tab), API calls (to the backend), and orchestrates the display of different tabs and components.
    *   **`App.css`**: Global styles, theming variables, and utility classes for the application.
    *   **`index.js`**: The JavaScript entry point that renders the `<App />` component into the DOM.
    *   **`index.css`**: Base global styles (often minimal after Create React App setup, with most styling in `App.css` or component-specific files).
    *   **`components/`**: This directory houses all the reusable React UI components that make up the various parts of the dashboard (e.g., `WelcomeMessage.js`, `CompanyDetailsTab.js`, `KeyMetricsTab.js`, `HistoricalDataTab.js`, `AnalysisTab.js`).
    *   **`apiAdapter.js`**: Contains functions responsible for transforming raw API responses (received from the backend server) into a consistent and more usable data structure for the client application.
    *   **`constants.js`**: Stores various constants used throughout the client application, such as backend API endpoint paths (e.g., `/api/stock`), UI display thresholds (e.g., number of news items to show), and placeholder texts. **Note: Actual external API keys are NOT stored here; they are managed securely by the backend server.**
    *   **`utils.js`**: A collection of utility functions for performing common tasks like financial metric calculations, technical indicator computations, data formatting (currency, percentages, etc.), and safe data access from potentially complex objects.
    *   Other files like `reportWebVitals.js` and `setupTests.js` are standard Create React App files for performance monitoring and test configuration respectively.

## Available Scripts

In the `stock_market_dashboard/client` directory, you can run the following standard Create React App scripts:

### `npm start`

Runs the app in development mode. This will typically open [http://localhost:3000](http://localhost:3000) in your default web browser. The page will reload if you make edits, and you will also see any lint errors in the console.

### `npm test`

Launches the test runner in interactive watch mode. See the Create React App documentation for more information on running tests.

### `npm run build`

Builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance. The build is minified and the filenames include hashes for caching.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices provided by Create React App, you can `eject` at any time. This command will remove the single build dependency (`react-scripts`) from your project and copy all the configuration files (webpack, Babel, ESLint, etc.) and transitive dependencies directly into your project so you have full control over them.

---

This README focuses on the client-side aspects of the Stock Market Dashboard. For full project details, including backend setup and overall architecture, please refer to the [main README at the project root](../../README.md).
