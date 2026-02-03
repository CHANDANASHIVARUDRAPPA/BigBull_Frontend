import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import SearchBar from './components/SearchBar';
import StockInfo from './components/StockInfo';
import Portfolio from './components/Portfolio';
import Transactions from './components/Transactions';
import Optimization from './components/Optimization';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<SearchBar />} />
          <Route path="stock/:symbol" element={<StockInfo />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="optimization" element={<Optimization />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;