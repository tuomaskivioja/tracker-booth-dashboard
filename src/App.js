import React from 'react';
import Dashboard from './components/Dashboard/Dashboard';
import Sidebar from './components/Sidebar/Sidebar';
import Code from './components/Code/Code';
import PrivacyPolicy from './components/PrivacyPolicy/PrivacyPolicy';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, SignOutButton, useUser } from "@clerk/clerk-react";
import SignInPage from './components/SignIn/SignIn';

function App() {
    const { isSignedIn, user, isLoaded } = useUser();

    return (
      <Router>
        <header>
          <SignedOut>
            <Routes>
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/" element={<SignInPage />} />
            </Routes>
          </SignedOut>
          <SignedIn>
            <Sidebar />
            <div className="content">
              <Routes>
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/code" element={<Code />} />
              </Routes>
            </div>
          </SignedIn>
        </header>
      </Router>
    );
}

export default App;
