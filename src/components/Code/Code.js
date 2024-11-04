import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import './Code.css';

const Code = () => {
    const { user } = useUser();
    const [copied, setCopied] = useState('');
    const [offerName, setOfferName] = useState('');
    const [generated, setGenerated] = useState(false);
    const [offers, setOffers] = useState([]);

    const trackerScript = (offer) => `
    <meta name="username" content="${user ? user.id : ''}">
    <meta name="offer" content="${offer}">
    <script src="https://d15dfsr886zcp9.cloudfront.net/tracker_script.js" defer></script>
`;

    const thankYouScript = (offer) => `
    <meta name="offer" content="${offer}">
    <script src="https://d15dfsr886zcp9.cloudfront.net/thankYou_script.js" defer></script>
`;

    const copyToClipboard = (code, label) => {
        navigator.clipboard.writeText(code);
        setCopied(label);
        setTimeout(() => setCopied(''), 2000);
    };

    const handleGenerate = () => {
        if (offerName.trim()) {
            setOffers([...offers, offerName]);
            setGenerated(true);
            setOfferName(offerName);
        } else {
            alert('Please enter an offer name.');
        }
    };

    return (
        <div className="code-container">

            <div className="code-content">
                <div className="code-generation">
                    <h1>Code Blocks</h1>
                    <p>In order for Revit to work, all you need to do is insert two code blocks into your website. Please follow the instructions below carefully.</p>

                    <div className="offer-input">
                        <label htmlFor="offer-name">Enter Offer Name:</label>
                        <input
                            type="text"
                            id="offer-name"
                            value={offerName}
                            onChange={(e) => setOfferName(e.target.value)}
                        />
                        <button onClick={handleGenerate}>Generate</button>
                    </div>

                    {generated && (
                        <>
                            <div className="code-block">
                                <h2>1. Tracker Script - copy & paste to your landing page(s)</h2>
                                <p>Copy & paste the snippet below to your <b>landing page header.</b> this is the page that your viewers will first enter after clicking a link in a video/email. It tracks user interactions with videos or emails on your page.</p>

                                <pre>{trackerScript(offerName)}</pre>
                                <button onClick={() => copyToClipboard(trackerScript(offerName), 'trackerScript')}>
                                    {copied === 'trackerScript' ? 'Copied!' : 'Copy'}
                                </button>
                            </div>

                            <div className="code-block">
                                <h2>2. Thank You Script - copy & paste to your thank you page(s)</h2>
                                <p>Copy & paste the snippet below to your <b>Thank You page.</b> This is the page that your customer enters after they make a purchase. It sends information about user purchases after they have completed a transaction.</p>

                                <pre>{thankYouScript(offerName)}</pre>
                                <button onClick={() => copyToClipboard(thankYouScript(offerName), 'thankYouScript')}>
                                    {copied === 'thankYouScript' ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                        </>
                    )}
                </div>

            </div>
            <div className="offers-list">
                    <h1>Created Offers</h1>
                    {offers.map((offer, index) => (
                        <div key={index} className="offer-item">
                            <p>{offer}</p>
                            <button onClick={() => copyToClipboard(trackerScript(offer), `trackerScript-${index}`)}>
                                {copied === `trackerScript-${index}` ? 'Copied!' : 'Copy Tracker Script'}
                            </button>
                            <button onClick={() => copyToClipboard(thankYouScript(offer), `thankYouScript-${index}`)}>
                                {copied === `thankYouScript-${index}` ? 'Copied!' : 'Copy Thank You Script'}
                            </button>
                        </div>
                    ))}
                </div>
        </div>
    );
};

export default Code;
