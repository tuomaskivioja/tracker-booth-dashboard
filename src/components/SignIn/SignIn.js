import React from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import './SignIn.css';  // Importing the CSS file for styling

const SignInPage = () => {
    return (
        <div className="signin-container">
            <SignUp path="/" />
        </div>
    );
};

export default SignInPage;
