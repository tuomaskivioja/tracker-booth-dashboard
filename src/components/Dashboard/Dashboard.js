import React, { useState, useEffect, useMemo } from 'react';
import './Dashboard.css';
import axios from 'axios';
import { fetchSalesData, handleLoginWithYouTube, fetchDataByDateRange, handleLogout, checkYouTubeLogin } from '../../utils/apiCalls';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useRevit } from '../../contexts/RevitContext';
import ActionsContainer from './ActionsContainer';
const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const Dashboard = () => {
    const [youtubeName, setYoutubeName] = useState(null);
    const [filterType, setFilterType] = useState('all');
    const [error, setError] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState('all');
    const [toggledRows, setToggledRows] = useState({});
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [isDateFiltered, setIsDateFiltered] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const { username, salesData, offers, setSalesData } = useRevit();

    const refreshYouTubeData = async () => {
        setIsRefreshing(true);
        try {
            const response = await axios.post(`https://${SERVER_URL}/api/refresh-yt-data/${username}`);
            alert(response.data.message);
            const data = await fetchSalesData(username);
            setSalesData(data);
        } catch (error) {
            console.error('Error refreshing YouTube data:', error);
            alert('Error refreshing YouTube data');
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (username) {
                const data = await checkYouTubeLogin(username);
                if (data && data.loggedIn) {
                    setYoutubeName(data.youtubeName);
                }
            }
        };
        fetchData();
    }, [username]);

    const filteredSales = salesData.map((resource) => {
        let totalClicks = 0;
        let totalSales = 0;
        let totalCallBookings = 0;

        resource.offers.forEach((offer) => {
            if (selectedOffer === 'all' || offer.offer_name === selectedOffer) {
                totalClicks += Number(offer.click_count) || 0;
                totalSales += Number(offer.sale_count) || 0;
                totalCallBookings += Number(offer.call_booking_count) || 0;
            }
        });

        return {
            ...resource,
            totalClicks,
            totalSales,
            totalCallBookings
        };
    }).filter((resource) => {
        return (resource.totalClicks > 0 || resource.totalSales > 0) &&
               (filterType === 'all' || resource.category === filterType);
    });

    const hasCallBookings = filteredSales.some(resource => resource.totalCallBookings > 0);

    const sortedSales = React.useMemo(() => {
        let sortableSales = [...filteredSales];
        if (sortConfig.key !== null) {
            sortableSales.sort((a, b) => {
                let aValue, bValue;

                if (sortConfig.key === 'salesPercentage') {
                    aValue = a.totalClicks ? (a.totalSales / a.totalClicks) * 100 : 0;
                    bValue = b.totalClicks ? (b.totalSales / b.totalClicks) * 100 : 0;
                } else if (sortConfig.key === 'clickPercentage') {
                    aValue = a.views ? (a.totalClicks / a.views) * 100 : 0;
                    bValue = b.views ? (b.totalClicks / b.views) * 100 : 0;
                } else {
                    aValue = Number(a[sortConfig.key]) || 0;
                    bValue = Number(b[sortConfig.key]) || 0;
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableSales;
    }, [filteredSales, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const toggleRow = (index) => {
        setToggledRows(prevState => ({
            ...prevState,
            [index]: !prevState[index]
        }));
    };

    const handleDateFilterSubmit = async () => {
        if (startDate && endDate) {
            const data = await fetchDataByDateRange(username, startDate, endDate);
            setSalesData(data);
            setIsDateFiltered(true);
        }
    };

    const resetDateFilter = async () => {
        setStartDate(null);
        setEndDate(null);
        setIsDateFiltered(false);
        const data = await fetchSalesData(username);
        setSalesData(data);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredAndSortedSales = useMemo(() => {
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        console.log('Search Term:', lowercasedSearchTerm);

        const filteredSales = sortedSales.filter(sale => {
            const saleName = sale.name.toLowerCase();
            const youtubeTitle = sale.youtube_title ? sale.youtube_title.toLowerCase() : '';
            console.log('Checking:', saleName, youtubeTitle);
            return saleName.includes(lowercasedSearchTerm) || youtubeTitle.includes(lowercasedSearchTerm);
        });

        console.log('Filtered Sales:', filteredSales);
        return filteredSales;
    }, [sortedSales, searchTerm]);

    return (
        <div className="dashboard-container">
            <div className="table-container">
                <h1>Welcome to Revit!</h1>
                {youtubeName ? (
                    <div>
                        <p>Logged in as: {youtubeName}</p>
                        <button className="youtube-button" onClick={() => handleLogout(username)}>
                            Logout from YouTube
                        </button>
                    </div>
                ) : (
                    <div>
                        <button className="youtube-button" onClick={() => handleLoginWithYouTube(username)}>
                            Login with YouTube
                        </button>
                    </div>
                )}

                <button className="refresh-button" onClick={refreshYouTubeData} disabled={isRefreshing}>
                    {isRefreshing ? 'Refreshing...' : 'Refresh YouTube Views'}
                </button>

                <h2>Sales and Clicks Dashboard</h2>

                <div className="filter-container">
                    <label htmlFor="category-filter">Filter by Category:</label>
                    <select
                        id="category-filter"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="all">All</option>
                        <option value="video">Video</option>
                        <option value="email">Email</option>
                        <option value="community">Community</option>
                        <option value="channel">Channel</option>
                        <option value="twitter">Twitter</option>
                        <option value="instagram">Instagram</option>
                    </select>
                </div>

                <div className="filter-container">
                    <label htmlFor="offer-filter">Filter by Offer:</label>
                    <select
                        id="offer-filter"
                        value={selectedOffer}
                        onChange={(e) => setSelectedOffer(e.target.value)}
                    >
                        <option value="all">All Offers</option>
                        {offers.map((offer) => (
                            <option key={offer.id} value={offer.name}>
                                {offer.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="date-range-picker">
                    <label htmlFor="start-date">Start Date:</label>
                    <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                        dateFormat="yyyy/MM/dd"
                        placeholderText="Select start date"
                    />
                    <label htmlFor="end-date">End Date:</label>
                    <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        minDate={startDate}
                        dateFormat="yyyy/MM/dd"
                        placeholderText="Select end date"
                    />
                    <button className="filter-button" onClick={handleDateFilterSubmit}>Apply filter</button>
                </div>

                {isDateFiltered && (
                    <div className="date-filter-info">
                        <span>
                            Date Range: {startDate?.toLocaleDateString()} - {endDate?.toLocaleDateString()}
                        </span>
                        <button onClick={resetDateFilter}>x</button>
                    </div>
                )}

                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="search-input"
                    />
                </div>

                {error ? (
                    <p className="error-message">{error}</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Source</th>
                                <th
                                    className={`sortable ${sortConfig.key === 'views' ? 'sorted' : ''}`}
                                    onClick={() => requestSort('views')}
                                >
                                    Views {sortConfig.key === 'views' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                                </th>
                                <th
                                    className={`sortable ${sortConfig.key === 'totalClicks' ? 'sorted' : ''}`}
                                    onClick={() => requestSort('totalClicks')}
                                >
                                    Clicks {sortConfig.key === 'totalClicks' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                                </th>
                                {hasCallBookings && (
                                    <th
                                        className={`sortable ${sortConfig.key === 'totalCallBookings' ? 'sorted' : ''}`}
                                        onClick={() => requestSort('totalCallBookings')}
                                    >
                                        Call Bookings {sortConfig.key === 'totalCallBookings' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                                    </th>
                                )}
                                <th
                                    className={`sortable ${sortConfig.key === 'totalSales' ? 'sorted' : ''}`}
                                    onClick={() => requestSort('totalSales')}
                                >
                                    Conversions {sortConfig.key === 'totalSales' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                                </th>
                                <th
                                    className={`sortable percentage-column ${sortConfig.key === 'clickPercentage' ? 'sorted' : ''}`}
                                    onClick={() => requestSort('clickPercentage')}
                                >
                                    Clicks % from Views {sortConfig.key === 'clickPercentage' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                                </th>
                                <th
                                    className={`sortable percentage-column ${sortConfig.key === 'salesPercentage' ? 'sorted' : ''}`}
                                    onClick={() => requestSort('salesPercentage')}
                                >
                                    Conversions % from Clicks {sortConfig.key === 'salesPercentage' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAndSortedSales.map((sale, index) => {
                                const clickPercentage = sale.views ? ((sale.totalClicks / sale.views) * 100).toFixed(2) : 'N/A';
                                const salesPercentage = sale.totalClicks ? ((sale.totalSales / sale.totalClicks) * 100).toFixed(2) : 'N/A';
                                const formattedViews = sale.views ? new Intl.NumberFormat().format(sale.views) : 'N/A';
                                return (
                                    <React.Fragment key={index}>
                                        <tr onClick={() => toggleRow(index)} className="clickable-row">
                                            <td style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                                                {selectedOffer === 'all' && (
                                                    <button className="expand-button">
                                                        {toggledRows[index] ? '-' : '+'}
                                                    </button>
                                                )}
                                                <span>{sale.category}</span>
                                            </td>
                                            <td>{sale.category === 'video' && sale.youtube_title ? sale.youtube_title : sale.name}</td>
                                            <td>{formattedViews}</td>
                                            <td>{Number(sale.totalClicks)}</td>
                                            {hasCallBookings && <td>{Number(sale.totalCallBookings)}</td>}
                                            <td>{Number(sale.totalSales)}</td>
                                            <td className="percentage-column">{clickPercentage}%</td>
                                            <td className="percentage-column">{salesPercentage}%</td>
                                        </tr>
                                        {toggledRows[index] && selectedOffer === 'all' && (
                                            <tr>
                                                <td colSpan={hasCallBookings ? "6" : "5"}>
                                                    <table className="nested-table">
                                                        <thead>
                                                            <tr>
                                                                <th>Offer Name</th>
                                                                <th>Clicks</th>
                                                                {hasCallBookings && <th>Call Bookings</th>}
                                                                <th>Conversions</th>
                                                                <th>Conversions % from Clicks</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {sale.offers.map((offer, offerIndex) => {
                                                                const offerSalesPercentage = offer.click_count ? ((offer.sale_count / offer.click_count) * 100).toFixed(2) : 'N/A';
                                                                return (
                                                                    <tr key={offerIndex}>
                                                                        <td>{offer.offer_name}</td>
                                                                        <td>{offer.click_count}</td>
                                                                        {hasCallBookings && <td>{offer.call_booking_count}</td>}
                                                                        <td>{offer.sale_count}</td>
                                                                        <td>{offerSalesPercentage}%</td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {youtubeName && (
                <ActionsContainer
                    youtubeName={youtubeName}
                    setSalesData={setSalesData}
                />
            )}
        </div>
    );
};

export default Dashboard;
