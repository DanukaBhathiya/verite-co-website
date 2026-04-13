import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Collections from './components/Collections';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import './App.css';

const getNormalizedPath = () => window.location.pathname.replace(/\/+$/, '') || '/';

function App() {
  const [showAdmin, setShowAdmin] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [showLogin, setShowLogin] = React.useState(false);

  const ADMIN_PASSWORD = 'verite2024'; // Change this password

  const goToPath = (path) => {
    if (getNormalizedPath() !== path) {
      window.history.pushState({}, '', path);
    }
  };

  const returnToSite = () => {
    goToPath('/');
    setShowAdmin(false);
    setShowLogin(false);
    setPassword('');
  };

  React.useEffect(() => {
    const onPopState = () => {
      const onAdminRoute = getNormalizedPath() === '/admin';
      if (onAdminRoute) {
        if (isAuthenticated) {
          setShowAdmin(true);
          setShowLogin(false);
        } else {
          setShowAdmin(false);
          setShowLogin(true);
        }
      } else {
        setShowLogin(false);
        if (!isAuthenticated) {
          setShowAdmin(false);
        }
      }
    };

    onPopState();
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setShowAdmin(true);
      setShowLogin(false);
      setPassword('');
      goToPath('/admin');
    } else {
      alert('Incorrect password!');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    returnToSite();
  };

  return (
    <div className="App">
      <Header />

      {showLogin && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }}
        >
          <div
            style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '10px',
              width: '300px'
            }}
          >
            <h3 style={{ marginTop: 0 }}>Admin Login</h3>
            <form onSubmit={handleLogin}>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginBottom: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '1rem'
                }}
                autoFocus
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: 'linear-gradient(135deg, #f3a6cc, #b39ddb, #9fd9ff)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={returnToSite}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: 'linear-gradient(135deg, #8e79c9, #7f73a1)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAdmin && isAuthenticated ? (
        <>
          <button
            onClick={handleLogout}
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #f3a6cc, #8e79c9)',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              zIndex: 1000
            }}
          >
            Logout
          </button>
          <AdminPanel />
        </>
      ) : (
        <>
          <Hero />
          <Collections />
          <About />
          <Contact />
          <Footer />
        </>
      )}
    </div>
  );
}

export default App;
