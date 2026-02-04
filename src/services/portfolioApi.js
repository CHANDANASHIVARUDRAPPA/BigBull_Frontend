import axios from 'axios';

const JAVA_BASE_URL = 'http://localhost:8080';
const javaApi = axios.create({ baseURL: JAVA_BASE_URL });

export const getPortfolioSummary = () => javaApi.get('/api/portfolio/summary');
