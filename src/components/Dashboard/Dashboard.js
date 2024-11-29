import React, { useState, useEffect } from 'react';
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
                totalClicks += offer.click_count;
                totalSales += offer.sale_count;
                totalCallBookings += offer.call_booking_count;
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
                const aValue = Number(a[sortConfig.key]) || 0;
                const bValue = Number(b[sortConfig.key]) || 0;

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
                    {isRefreshing ? 'Refreshing...' : 'Refresh YouTube Data'}
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

                {error ? (
                    <p className="error-message">{error}</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Source</th>
                                <th
                                    className={`sortable ${sortConfig.key === 'totalClicks' ? 'sorted' : ''}`}
                                    onClick={() => requestSort('totalClicks')}
                                >
                                    Clicks {sortConfig.key === 'totalClicks' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                                </th>
                                {hasCallBookings && <th>Call Bookings</th>}
                                <th
                                    className={`sortable ${sortConfig.key === 'totalSales' ? 'sorted' : ''}`}
                                    onClick={() => requestSort('totalSales')}
                                >
                                    Conversions {sortConfig.key === 'totalSales' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                                </th>
                                <th>Conversions % from Clicks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedSales.map((sale, index) => {
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
                                            <td>{Number(sale.totalClicks)}</td>
                                            {hasCallBookings && <td>{Number(sale.totalCallBookings)}</td>}
                                            <td>{Number(sale.totalSales)}</td>
                                            <td>{salesPercentage}%</td>
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
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {sale.offers.map((offer, offerIndex) => (
                                                                <tr key={offerIndex}>
                                                                    <td>{offer.offer_name}</td>
                                                                    <td>{offer.click_count}</td>
                                                                    {hasCallBookings && <td>{offer.call_booking_count}</td>}
                                                                    <td>{offer.sale_count}</td>
                                                                </tr>
                                                            ))}
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
