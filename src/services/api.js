import axios from 'axios';

const FLASK_BASE_URL = 'http://localhost:5000';
const JAVA_BASE_URL = 'http://localhost:8080';

export const flaskApi = axios.create({ baseURL: FLASK_BASE_URL });
export const javaApi = axios.create({ baseURL: JAVA_BASE_URL });

// Flask endpoints
export const searchStocks = (query, maxResults = 5) => flaskApi.get(`/api/search?query=${query}&max_results=${maxResults}`);
export const getStockHistory = (symbol, timeframe = '1M') => flaskApi.get(`/api/stock/history/${symbol}?timeframe=${timeframe}`);
export const getStockInfo = (symbol) => flaskApi.get(`/api/stock/info/${symbol}`);
export const getStockQuote = (symbol) => flaskApi.get(`/api/stock/quote/${symbol}`);
export const optimizePortfolio = (params) => flaskApi.get('/api/portfolio/optimize', { params });

// Java endpoints
export const getAllTransactions = () => javaApi.get('/api/transactions');
export const getTransactionById = (id) => javaApi.get(`/api/transactions/${id}`);
export const getTransactionsByAssetId = (assetId) => javaApi.get(`/api/transactions/asset/${assetId}`);
export const getTransactionsBySymbol = (symbol) => javaApi.get(`/api/transactions/symbol/${symbol}`);
export const createTransaction = (data) => javaApi.post('/api/transactions', data);
export const deleteTransaction = (id) => javaApi.delete(`/api/transactions/${id}`);
export const getAssets = () => javaApi.get('/api/assets');