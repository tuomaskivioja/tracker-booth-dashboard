import React, { useState, useEffect, useMemo } from 'react';
import { useUser } from '@clerk/clerk-react';
import './Code.css';
import { fetchOffers } from '../../utils/apiCalls';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const Code = () => {
    const { user } = useUser();
    const [copied, setCopied] = useState('');
    const [offerName, setOfferName] = useState('');
    const [conversionValue, setConversionValue] = useState('');
    const [generated, setGenerated] = useState(false);
    const [offers, setOffers] = useState([]);
    const [requireCallBooking, setRequireCallBooking] = useState(false);
    const [editOffer, setEditOffer] = useState(null);
    const [newOfferName, setNewOfferName] = useState('');
    const [newConversionValue, setNewConversionValue] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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

    const filteredOffers = useMemo(() => {
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        return offers.filter(offer =>
            offer.name.toLowerCase().includes(lowercasedSearchTerm)
        );
    }, [offers, searchTerm]);

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

    const addOffer = async (offerName, conversionValue) => {
        setIsLoading(true);
        try {
            const response = await axios.post(`https://${SERVER_URL}/api/add-offer`, {
                username: user.id,
                offerName: offerName,
                conversionValue: conversionValue || 0,
                callBookingRequired: requireCallBooking
            });
            if (response.data.offerId) {
                setOffers([...offers, { id: response.data.offerId, name: offerName, conversion_value: conversionValue || 0, call_booking_required: requireCallBooking }]);
                setGenerated(true);
            } else {
                alert('Offer already exists for this user');
            }
        } catch (error) {
            console.error('Error adding offer:', error);
            alert('Error adding offer');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerate = () => {
        if (offerName.trim()) {
            addOffer(offerName, conversionValue);
            setOfferName('');
            setConversionValue('');
        } else {
            alert('Please enter an offer name.');
        }
    };

    const handleEditOffer = (offer) => {
        setEditOffer(offer.id);
        setNewOfferName(offer.name);
        setNewConversionValue(offer.conversion_value || 0);
    };

    const handleSaveOffer = async (offerId) => {
        try {
            await axios.post(`https://${SERVER_URL}/api/edit-offer`, {
                offerId: offerId,
                newName: newOfferName,
                newConversionValue: parseFloat(newConversionValue)
            });
            // Update the offers list with the new data
            setOffers(offers.map(o => o.id === offerId ? { ...o, name: newOfferName, conversion_value: parseFloat(newConversionValue) } : o));
            setEditOffer(null);
        } catch (error) {
            console.error('Error updating offer:', error);
            alert('Error updating offer');
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
                        <label htmlFor="conversion-value">Conversion Value (optional):</label>
                        <input
                            type="number"
                            id="conversion-value"
                            placeholder="Optional"
                            value={conversionValue}
                            onChange={(e) => setConversionValue(e.target.value)}
                        />
                        <button onClick={handleGenerate} disabled={isLoading}>
                            {isLoading ? 'Generating...' : 'Generate'}
                        </button>
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
                                <p>Note: make sure this page is under the same domain as your landing page above.</p>
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
                <input
                    type="text"
                    placeholder="Search offers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                {filteredOffers.map((offer) => (
                    <div key={offer.id} className="offer-item">
                        <div className="offer-header">
                            <p className="offer-name">{offer.name}</p>
                            <FontAwesomeIcon
                                icon={faEdit}
                                className="edit-icon"
                                onClick={() => handleEditOffer(offer)}
                            />
                        </div>
                        {editOffer === offer.id ? (
                            <div className="edit-offer-form">
                                <input
                                    type="text"
                                    value={newOfferName}
                                    onChange={(e) => setNewOfferName(e.target.value)}
                                    placeholder="Offer Name"
                                />
                                <input
                                    type="number"
                                    value={newConversionValue}
                                    onChange={(e) => setNewConversionValue(e.target.value)}
                                    placeholder="Conversion Value"
                                />
                                <button onClick={() => handleSaveOffer(offer.id)}>Save</button>
                                <button onClick={() => setEditOffer(null)}>Cancel</button>
                            </div>
                        ) : (
                            <>
                                <p>Conversion Value: ${offer.conversion_value !== null && offer.conversion_value !== undefined ? offer.conversion_value : 0}</p>
                                <div className="code-button">
                                    <button onClick={() => copyToClipboard(trackerScript(offer.name), `trackerScript-${offer.id}`)}>
                                        {copied === `trackerScript-${offer.id}` ? 'Copied!' : 'Copy Tracker Script'}
                                    </button>
                                    <div className="tooltip-icon">
                                        ?
                                        <div className="tooltip-text">This code should be placed on your <b>landing page</b></div>
                                    </div>
                                </div>
                                <div className="code-button">
                                    <button onClick={() => copyToClipboard(thankYouScript(offer.name), `thankYouScript-${offer.id}`)}>
                                        {copied === `thankYouScript-${offer.id}` ? 'Copied!' : 'Copy Thank You Script'}
                                    </button>
                                    <div className="tooltip-icon">
                                        ?
                                        <div className="tooltip-text">This code should be placed on your <b>Thank You page</b></div>
                                    </div>
                                </div>
                                {offer.call_booking_required && (
                                    <div className="code-button">
                                        <button onClick={() => copyToClipboard(callBookingScript(offer.name), `callBookingScript-${offer.id}`)}>
                                            {copied === `callBookingScript-${offer.id}` ? 'Copied!' : 'Copy Call Booking Script'}
                                        </button>
                                        <div className="tooltip-icon">
                                            ?
                                            <div className="tooltip-text">This code should be placed on your <b>Call Booking thank you page</b></div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Code;
