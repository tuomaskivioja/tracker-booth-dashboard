import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import './Code.css';
import { fetchOffers } from '../../utils/apiCalls';
import axios from 'axios';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const Code = () => {
    const { user } = useUser();
    const [copied, setCopied] = useState('');
    const [offerName, setOfferName] = useState('');
    const [generated, setGenerated] = useState(false);
    const [offers, setOffers] = useState([]);
    const [requireCallBooking, setRequireCallBooking] = useState(false);

    useEffect(() => {
        const loadOffers = async () => {
            try {
                const userOffers = await fetchOffers(user.id);
                setOffers(userOffers);
            } catch (error) {
                console.error('Error fetching offers:', error);
            }
        };

        if (user) {
            loadOffers();
        }
    }, [user]);

    const trackerScript = (offer) => `
    <meta name="username" content="${user ? user.id : ''}">
    <meta name="offer" content="${offer}">
    <script src="https://d15dfsr886zcp9.cloudfront.net/tracker_script.js" defer></script>
`;

    const thankYouScript = (offer) => `
    <meta name="offer" content="${offer}">
    <script src="https://d15dfsr886zcp9.cloudfront.net/thankYou_script.js" defer></script>
`;

    const callBookingScript = (offer) => `
    <meta name="offer" content="${offer}">
    <script src="https://d15dfsr886zcp9.cloudfront.net/callBookingThankYouScript.js" defer></script>
`;

    const copyToClipboard = (code, label) => {
        navigator.clipboard.writeText(code);
        setCopied(label);
        setTimeout(() => setCopied(''), 2000);
    };

    const addOffer = async (offerName) => {
        try {
            const response = await axios.post(`https://${SERVER_URL}/api/add-offer`, {
                username: user.id,
                offerName: offerName,
                callBookingRequired: requireCallBooking
            });
            if (response.data.offerId) {
                setOffers([...offers, { id: response.data.offerId, name: offerName, call_booking_required: requireCallBooking }]);
                setGenerated(true);
            } else {
                alert('Offer already exists for this user');
            }
        } catch (error) {
            console.error('Error adding offer:', error);
            alert('Error adding offer');
        }
    };

    const handleGenerate = () => {
        if (offerName.trim()) {
            addOffer(offerName);
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

                    <div className="call-booking-switch">
                        <label htmlFor="call-booking">Do your customers have to book a call before buying?</label>
                        <label className="switch">
                            <input
                                type="checkbox"
                                id="call-booking"
                                checked={requireCallBooking}
                                onChange={(e) => setRequireCallBooking(e.target.checked)}
                            />
                            <span className="slider round"></span>
                        </label>
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

                            {requireCallBooking && (
                                <div className="code-block">
                                    <h2>2. Call Booking Thank You Script - copy & paste to your call booking thank you page</h2>
                                    <p>Copy & paste the snippet below to your <b>Call Booking thank you page.</b> This is the page where your customers land right after booking a call.</p>

                                    <pre>{callBookingScript(offerName)}</pre>
                                    <button onClick={() => copyToClipboard(callBookingScript(offerName), 'callBookingScript')}>
                                        {copied === 'callBookingScript' ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                            )}

                            <div className="code-block">
                                <h2>{requireCallBooking ? '3. Thank You Script - copy & paste to your thank you page' : '2. Thank You Script - copy & paste to your thank you page'}</h2>
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
                    <div key={offer.id} className="offer-item">
                        <p>{offer.name}</p>
                        <button onClick={() => copyToClipboard(trackerScript(offer.name), `trackerScript-${index}`)}>
                            {copied === `trackerScript-${index}` ? 'Copied!' : 'Copy Tracker Script'}
                        </button>
                        <button onClick={() => copyToClipboard(thankYouScript(offer.name), `thankYouScript-${index}`)}>
                            {copied === `thankYouScript-${index}` ? 'Copied!' : 'Copy Thank You Script'}
                        </button>
                        {offer.call_booking_required && (
                            <button onClick={() => copyToClipboard(callBookingScript(offer.name), `callBookingScript-${index}`)}>
                                {copied === `callBookingScript-${index}` ? 'Copied!' : 'Copy Call Booking Script'}
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Code;
