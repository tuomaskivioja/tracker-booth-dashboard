import React from 'react';
import Dashboard from './components/Dashboard/Dashboard';
import Sidebar from './components/Sidebar/Sidebar';
import Code from './components/Code/Code';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton, SignOutButton } from "@clerk/clerk-react";
import SignInPage from './components/SignIn/SignIn';

function App() {
    return (
      <Router>
      <header>
      <SignedOut>
        <SignInPage />
      </SignedOut>
      <SignedIn>
      <Sidebar />
      <SignOutButton style={{
          backgroundColor: '#e74c3c',
        }} />
        <div className="content">
            <Routes>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/code" element={<Code />} />
            </Routes>
        </div>
        {/* <UserButton /> */}
      </SignedIn>
    </header>
    </Router>
        // <div className="App">
            
        // </div>
    );
}

export default App;
