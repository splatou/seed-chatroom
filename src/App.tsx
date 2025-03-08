import React, { useState } from 'react';
import ChatRoom from './components/ChatRoom';

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  
  // Simple admin authentication
  const adminPassword = 'theseed2025'; // You should store this securely in a real application
  
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === adminPassword) {
      setIsAdmin(true);
      setShowAdminLogin(false);
      console.log('Admin login successful');
    } else {
      alert('Incorrect password');
      console.log('Admin login failed');
    }
  };
  
  const handleLogout = () => {
    setIsAdmin(false);
    console.log('Admin logged out');
  };

  return (
    <div className="relative">
      <ChatRoom isAdmin={isAdmin} />
      
      {/* Admin toggle button */}
      <button 
        onClick={() => setShowAdminLogin(true)}
        className="admin-button"
      >
        Admin
      </button>
      
      {isAdmin && (
        <button 
          onClick={handleLogout}
          className="logout-button"
        >
          Logout
        </button>
      )}
      
      {/* Admin login modal */}
      {showAdminLogin && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Admin Login</h2>
            <form onSubmit={handleAdminLogin}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="form-input"
              />
              <div className="button-row">
                <button
                  type="submit"
                  className="form-button"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdminLogin(false)}
                  className="form-button cancel-button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;