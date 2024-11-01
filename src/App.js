import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard/Dashboard';
import Sidebar from './components/Sidebar/Sidebar';
import Code from './components/Code/Code';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton, SignOutButton, useUser } from "@clerk/clerk-react";
import SignInPage from './components/SignIn/SignIn';
import axios from 'axios';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

function App() {
    const { isSignedIn, user, isLoaded } = useUser(); 
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(true);
    

    // useEffect(() => {
    //     if (user) {
    //         const checkSubscription = async () => {
    //             try {
    //                 setLoading(true);
    //                 const response = await axios.get(`https://${SERVER_URL}/api/check-subscription`, {
    //                     params: { userId: user.id }
    //                 });
    //                 setIsSubscribed(response.data.isSubscribed);

    //                 if (!response.data.isSubscribed) {
    //                     const checkoutResponse = await axios.post(`https://${SERVER_URL}/api/create-checkout-session`, {
    //                         userId: user.id
    //                     });

    //                     window.location.href = checkoutResponse.data.url;
    //                 }
    //             } catch (error) {
    //                 console.error('Error checking subscription:', error);
    //             } finally {
    //                 setLoading(false);
    //             }
    //         };

    //         checkSubscription();
    //     } else {
    //         setLoading(false);
    //     }
    // }, [user]);

    return (
      <Router>
      <header>
      <SignedOut>
        <SignInPage />
      </SignedOut>
      <SignedIn>
        {/* {loading ? (
            <h1>Loading...</h1>
        ) : isSubscribed ? (
            <>
                <Sidebar />
                <SignOutButton style={{ backgroundColor: '#e74c3c' }} />
                <div className="content">
                    <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/code" element={<Code />} />
                    </Routes>
                </div>
            </>
        ) : (
            <h1>Revit subscription not found, opening checkout page...</h1>
        )} */}
        <Sidebar />
                <SignOutButton style={{ backgroundColor: '#e74c3c' }} />
                <div className="content">
                    <Routes>
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
