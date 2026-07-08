import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Pasaj } from './pages/Pasaj';
import { Transactions } from './pages/Transactions';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pasaj" element={<Pasaj />} />
          <Route path="/transactions" element={<Transactions />} />
        </Routes>
      </main>
      <footer style={{ padding: '2rem 1.5rem', textAlign: 'center', borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        &copy; {new Date().getFullYear()} Turkcell. Dealer Map Integration Intern Project. All rights reserved.
      </footer>
    </BrowserRouter>
  );
}

export default App;
