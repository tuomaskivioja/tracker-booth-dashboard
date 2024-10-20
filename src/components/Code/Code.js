import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import './Code.css';

const Code = () => {
    const { user } = useUser(); // Clerk user object to dynamically set the username
    const [copied, setCopied] = useState('');
    const [offerName, setOfferName] = useState('');
    const [generated, setGenerated] = useState(false);

    // Dynamically set the username and offer name in the tracker script
    const trackerScript = `
    <meta name="username" content="${user ? user.id : ''}">
    <meta name="offer" content="${offerName}">
    <script src="https://d15dfsr886zcp9.cloudfront.net/tracker_script.js" defer></script>
`;

    const thankYouScript = `
    <meta name="offer" content="${offerName}">
    <script src="https://d15dfsr886zcp9.cloudfront.net/thankYou_script.js" defer></script>
`;

    const copyToClipboard = (code, label) => {
        navigator.clipboard.writeText(code);
        setCopied(label);
        setTimeout(() => setCopied(''), 2000);
    };

    const handleGenerate = () => {
        if (offerName.trim()) {
            setGenerated(true);
        } else {
            alert('Please enter an offer name.');
        }
    };

    const handleAddAnotherOffer = () => {
        setOfferName('');
        setGenerated(false);
    };

    return (
        <div className="code-container">
            <h1>Code Blocks</h1>

            <p>In order for Tracker Booth to work, all you need to do is insert two code blocks into your website. Please follow the instructions below carefully.</p>

            <div className="offer-input">
                <label htmlFor="offer-name">Enter Offer Name:</label>
                <input
                    type="text"
                    id="offer-name"
                    value={offerName}
                    onChange={(e) => setOfferName(e.target.value)}
                />
                {generated ? (
                    <button onClick={handleAddAnotherOffer}>Add Another Offer</button>
                ) : (
                    <button onClick={handleGenerate}>Generate</button>
                )}
            </div>

            {generated && (
                <>
                    <div className="code-block">
                        <h2>1. Tracker Script - copy & paste to your landing page(s)</h2>
                        <p>Copy & paste the snippet below to your <b>landing page header.</b> this is the page that your viewers will first enter after clicking a link in a video/email. It tracks user interactions with videos or emails on your page.</p>

                        <pre>{trackerScript}</pre>
                        <button onClick={() => copyToClipboard(trackerScript, 'trackerScript')}>
                            {copied === 'trackerScript' ? 'Copied!' : 'Copy'}
                        </button>
                    </div>

                    <div className="code-block">
                        <h2>2. Thank You Script - copy & paste to your thank you page(s)</h2>
                        <p>Copy & paste the snippet below to your <b>Thank You page.</b> This is the page that your customer enters after they make a purchase. It sends information about user purchases after they have completed a transaction.</p>

                        <pre>{thankYouScript}</pre>
                        <button onClick={() => copyToClipboard(thankYouScript, 'thankYouScript')}>
                            {copied === 'thankYouScript' ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Code;
