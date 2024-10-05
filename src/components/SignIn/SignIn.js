import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import './SignIn.css';  // Importing the CSS file for styling

const SignInPage = () => {
    return (
        <div className="signin-container">
            <SignIn path="/" />
        </div>
    );
};

export default SignInPage;
