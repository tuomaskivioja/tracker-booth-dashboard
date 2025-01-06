import React, { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard/Dashboard';
import Sidebar from './components/Sidebar/Sidebar';
import Code from './components/Code/Code';
import PrivacyPolicy from './components/PrivacyPolicy/PrivacyPolicy';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, SignOutButton, useUser } from "@clerk/clerk-react";
import SignInPage from './components/SignIn/SignIn';
import Activity from './components/Activity/Activity';
import { useRevit } from './contexts/RevitContext'

function App() {
    const SERVER_URL = process.env.REACT_APP_SERVER_URL;
    const { isSignedIn, user, isLoaded } = useUser();
    const { username } = useRevit();
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState(null);

    // useEffect(() => {
    //     const checkSubscription = async () => {
    //         console.log(subscriptionExpiresAt)
    //         if (subscriptionExpiresAt) {
    //           const now = new Date();
    //           const expiresAt = new Date(subscriptionExpiresAt);

    //           console.log(expiresAt, now)

    //           if (expiresAt > now) {
    //             setIsSubscribed(true);
    //             return;
    //           } else {
    //             setIsSubscribed(false);
    //             createCheckoutSession()
    //           }
    //         }
    //         if (isSignedIn && user && username) {
    //             try {
    //                 const response = await fetch(`https://${SERVER_URL}/api/check-subscription/${username}`, {
    //                     method: 'GET',
    //                     headers: {
    //                         'Content-Type': 'application/json',
    //                     },
    //                 });

    //                 if (!response.ok) {
    //                     throw new Error('Failed to check subscription status');
    //                 }

    //                 const subscriptionData = await response.json();
    //                 setIsSubscribed(subscriptionData.isSubscribed);
    //                 setSubscriptionExpiresAt(subscriptionData.subscriptionExpiresAt);

    //                 console.log('Subscription status:', subscriptionData);
    //             } catch (error) {
    //                 console.error('Error checking subscription status:', error);
    //             }
    //         }
    //     };

    //     checkSubscription();
    // }, [isSignedIn, user, username, subscriptionExpiresAt, isSubscribed]);

    // const createCheckoutSession = async () => {
    //     try {
    //         const response = await fetch(`https://${SERVER_URL}/api/create-checkout-session`, {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({ userId: username }),
    //         });

    //         if (!response.ok) {
    //             throw new Error('Failed to create checkout session');
    //         }

    //         const { url } = await response.json();
    //         window.location.href = url;
    //     } catch (error) {
    //         console.error('Error creating checkout session:', error);
    //     }
    // };

    return (
      <Router>
        <header>
          <SignedOut>
            <Routes>
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/" element={<SignInPage />} />
                <Route path="/dashboard" element={<Navigate to="/" />} />
            </Routes>
          </SignedOut>
          <SignedIn>
            {/* {isSubscribed ? (
              <> */}
                <Sidebar />
                <div className="content">
                  <Routes>
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/code" element={<Code />} />
                    <Route path="/activity" element={<Activity />} />
                  </Routes>
                </div>
              {/* </>
            ) : (
              <div>
                <p></p>
              </div>
            )} */}
          </SignedIn>
        </header>
      </Router>
    );
}

export default App;
