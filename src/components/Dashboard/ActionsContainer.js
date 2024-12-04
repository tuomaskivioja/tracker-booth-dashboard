import React, { useState } from 'react';
import axios from 'axios';
import { useRevit } from '../../contexts/RevitContext';

const ActionsContainer = ({ youtubeName, setSalesData }) => {
    const [videoLink, setVideoLink] = useState('');
    const [specificVideoLandingPage, setSpecificVideoLandingPage] = useState('');
    const [allVideosLandingPage, setAllVideosLandingPage] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [oldLink, setOldLink] = useState('');
    const [newLink, setNewLink] = useState('');
    const [isReplacing, setIsReplacing] = useState(false);
    const [targetUrl, setTargetUrl] = useState('');
    const [targetUrlForAll, setTargetUrlForAll] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);

    const { username } = useRevit();

    const SERVER_URL = process.env.REACT_APP_SERVER_URL;

    const extractVideoId = (url) => {
        const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|.+\?v=)?|youtu\.be\/)([^&\n?#]+)/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    const handleLinkAction = async () => {
        const videoId = extractVideoId(videoLink);
        if (!videoId) {
            alert('Invalid YouTube video link');
            return;
        }

        setIsUpdating(true);
        try {
            const response = await axios.put(`https://${SERVER_URL}/api/update-video-description/${videoId}`, {
                userId: username,
                url: specificVideoLandingPage.trim()
            });
            alert(response.data.message);
        } catch (error) {
            console.error('Error handling link action:', error);
            alert('Error handling link action');
        } finally {
            setIsUpdating(false);
        }
    };

    const updateTrackingLinksForAllVideos = async () => {
        setIsUpdating(true);
        try {
            const response = await axios.put(`https://${SERVER_URL}/api/add-tracking-to-videos`, {
                userId: username,
                url: allVideosLandingPage
            });
            alert(response.data.message);
        } catch (error) {
            console.error('Error updating tracking links:', error);
            alert('Error updating tracking links');
        } finally {
            setIsUpdating(false);
        }
    };

    const replaceLinksInVideos = async () => {
        setIsReplacing(true);
        try {
            const response = await axios.put(`https://${SERVER_URL}/api/replace-link-in-videos`, {
                userId: username,
                oldLink,
                newLink
            });
            alert(response.data.message);
        } catch (error) {
            console.error('Error replacing links:', error);
            alert('Error replacing links');
        } finally {
            setIsReplacing(false);
        }
    };

    const cleanLinkInVideo = async () => {
        const videoId = extractVideoId(videoLink);
        if (!videoId) {
            alert('Invalid YouTube video link');
            return;
        }

        try {
            const response = await axios.put(`https://${SERVER_URL}/api/clean-link-in-video/${videoId}`, {
                userId: username,
                targetUrl
            });

            alert(response.data.message);
        } catch (error) {
            console.error('Error cleaning link in video:', error);
            alert('Error cleaning link in video');
        }
    };

    const cleanLinkInAllVideos = async () => {
        setIsReplacing(true);
        try {
            const response = await axios.put(`https://${SERVER_URL}/api/clean-link-in-all-videos`, {
                userId: username,
                targetUrl: targetUrlForAll
            });

            alert(response.data.message);
        } catch (error) {
            console.error('Error cleaning links in all videos:', error);
            alert('Error cleaning links in all videos');
        } finally {
            setIsReplacing(false);
        }
    };

    const handleUpdateClick = () => {
        setShowModal(true);
    };

    const handleConfirmChange = (e) => {
        setIsConfirmed(e.target.checked);
    };

    const handleProceedClick = () => {
        setShowModal(false);
        setIsUpdating(true);
        updateTrackingLinksForAllVideos();
    };

    return (
        <div className="actions-container">
            {/* Section for adding or updating tracking link to a specific video */}
            <div className="add-update-link">
                <h3>Update Tracking Link for a Specific Video</h3>
                <p> This will add the Revit tracking parameter to the link in the video description</p>
                <input
                    type="text"
                    placeholder="Enter YouTube video link"
                    value={videoLink}
                    onChange={(e) => setVideoLink(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Enter landing page URL (without any utm parameters)"
                    value={specificVideoLandingPage}
                    onChange={(e) => setSpecificVideoLandingPage(e.target.value.trim())}
                />
                <button onClick={handleLinkAction} disabled={isUpdating}>
                    {isUpdating ? 'Processing...' : 'Update Link'}
                </button>
            </div>
            {/* Section for updating tracking links for all videos */}
            <div className="update-tracking-links">
                <h3>Update Tracking Links for All Videos</h3>
                <p> Warning: Only use this after you have tested the link in a specific video using the form above</p>
                <input
                    type="text"
                    placeholder="Enter landing page URL"
                    value={allVideosLandingPage}
                    onChange={(e) => setAllVideosLandingPage(e.target.value.trim())}
                />
                <button onClick={handleUpdateClick} disabled={isUpdating}>
                    {isUpdating ? 'Updating...' : 'Update Tracking Links'}
                </button>

                {showModal && (
                    <div className="modal">
                        <div className="modal-content">
                            <h4>Warning: </h4>
                            <p>This operation will update your links for <b>all videos.</b></p>
                            <p>Before proceeding, please confirm that you have tested updating one video and it worked correctly.</p>
                            <p>If it did not, please reach out to us for support.</p>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={isConfirmed}
                                    onChange={handleConfirmChange}
                                />
                                I have tested updating one video using the form above and it worked correctly.
                            </label>
                            <button
                                onClick={handleProceedClick}
                                disabled={!isConfirmed}
                                className={isConfirmed ? 'active' : 'disabled'}
                            >
                                Proceed with Update
                            </button>
                            <button onClick={() => setShowModal(false)}>Cancel</button>
                        </div>
                    </div>
                )}
            </div>

            {/* New Section for Replacing Links in Video Descriptions */}
            <div className="replace-link-in-videos">
                <h3>Replace Links in Video Descriptions</h3>
                <input
                    type="text"
                    placeholder="Enter old link"
                    value={oldLink}
                    onChange={(e) => setOldLink(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Enter new link"
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                />
                <button onClick={replaceLinksInVideos} disabled={isReplacing}>
                    {isReplacing ? 'Replacing...' : 'Replace Links'}
                </button>
            </div>

            <div className="clean-link-in-video">
                <h3>Reset Link in Video Description</h3>
                <p> This will remove any utm parameters from the link in the video description</p>

                <input
                    type="text"
                    placeholder="Enter YouTube video link"
                    value={videoLink}
                    onChange={(e) => setVideoLink(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Enter target URL"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                />
                <button onClick={cleanLinkInVideo}>
                    Clean Link
                </button>
            </div>

            {/* New Section for cleaning link in all video descriptions */}
            <div className="clean-link-in-all-videos">
                <h3>Reset Link in All Video Descriptions</h3>
                <p> This will remove any utm parameters from the link in all video descriptions</p>
                <input
                    type="text"
                    placeholder="Enter target URL"
                    value={targetUrlForAll}
                    onChange={(e) => setTargetUrlForAll(e.target.value)}
                />
                <button onClick={cleanLinkInAllVideos} disabled={isReplacing}>
                    {isReplacing ? 'Cleaning...' : 'Clean Links'}
                </button>
            </div>
        </div>
    );
};

export default ActionsContainer;
