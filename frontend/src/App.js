import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import GameDetail from './pages/GameDetail';
import Checkout from './pages/Checkout';
import Confirmation from './pages/Confirmation';

const Navbar = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #388e3c 100%)',
      padding: '0 24px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
      }}>
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          textDecoration: 'none',
          color: '#fff',
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            backdropFilter: 'blur(4px)',
          }}>
            &#9917;
          </div>
          <span style={{
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: '-0.5px',
          }}>
            KickSlot
          </span>
        </Link>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          {!isHome && (
            <Link to="/" style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: 14,
              fontWeight: 500,
              padding: '8px 16px',
              borderRadius: 8,
              transition: 'all 0.2s ease',
              textDecoration: 'none',
              backgroundColor: 'rgba(255,255,255,0.1)',
            }}>
              Browse Games
            </Link>
          )}
          <div style={{
            color: '#fff',
            fontSize: 13,
            fontWeight: 500,
            padding: '8px 16px',
            borderRadius: 8,
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}>
            PH &#x20B1;
          </div>
        </div>
      </div>
    </nav>
  );
};

const Footer = () => (
  <footer style={{
    marginTop: 'auto',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    color: 'rgba(255,255,255,0.7)',
    padding: '48px 24px 24px',
  }}>
    <div style={{
      maxWidth: 1200,
      margin: '0 auto',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 32,
        marginBottom: 32,
      }}>
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12,
          }}>
            <span style={{ fontSize: 20 }}>&#9917;</span>
            <span style={{
              fontSize: 18,
              fontWeight: 800,
              color: '#fff',
              letterSpacing: '-0.5px',
            }}>
              KickSlot
            </span>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.6 }}>
            Book your spot. Play together. The easiest way to find and join football games in the Philippines.
          </p>
        </div>

        <div>
          <h4 style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Quick Links
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, textDecoration: 'none' }}>Browse Games</Link>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>How It Works</span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Contact Us</span>
          </div>
        </div>

        <div>
          <h4 style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Locations
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 14 }}>BGC, Taguig</span>
            <span style={{ fontSize: 14 }}>Makati City</span>
            <span style={{ fontSize: 14 }}>Quezon City</span>
            <span style={{ fontSize: 14 }}>Pasig City</span>
          </div>
        </div>
      </div>

      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.1)',
        paddingTop: 20,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
        fontSize: 13,
      }}>
        <span>&copy; {new Date().getFullYear()} KickSlot. All rights reserved.</span>
        <span style={{ color: 'rgba(255,255,255,0.4)' }}>Made with passion for football in the Philippines</span>
      </div>
    </div>
  </footer>
);

function App() {
  return (
    <Router>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game/:id" element={<GameDetail />} />
          <Route path="/checkout/:id" element={<Checkout />} />
          <Route path="/confirmation/:id" element={<Confirmation />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
