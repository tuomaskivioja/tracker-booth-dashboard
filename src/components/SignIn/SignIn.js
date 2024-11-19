import React from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import './SignIn.css';  // Importing the CSS file for styling
import { RedirectToSignIn } from '@clerk/clerk-react';

const SignInPage = () => {
    return (
        <div className="signin-container">
            <RedirectToSignIn
          signInForceRedirectUrl="https://app.getrevit.com/dashboard"
          signUpForceRedirectUrl="https://app.getrevit.com/dashboard"
        />
        </div>
    );
};

export default SignInPage;
