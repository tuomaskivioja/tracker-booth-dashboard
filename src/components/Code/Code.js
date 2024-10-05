import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import './Code.css';

const Code = () => {
    const { user } = useUser(); // Clerk user object to dynamically set the username
    const [copied, setCopied] = useState('');

    const trackerScript = `
<script>
// Function to get a cookie by name
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Function to set a cookie
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
    console.log('Cookie set:', document.cookie);
}

// Dynamically set customer username using Clerk user ID
const customerUsername = '${user ? user.id : ''}';

// Function to save the tag and hardcoded customer username as a cookie
function saveUserTagAndCustomerUsername() {
    const tag = generateUserTag();
    const userInfo = {
        tag: tag,
        username: customerUsername
    };
    setCookie('userInfo', JSON.stringify(userInfo), 30);
    console.log('User Info Saved:', userInfo);
}

// Function to get the "video" or "email" parameter from the URL and return the resourceClicked object
function getResourceClicked() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('video')) {
        return { type: 'video', name: params.get('video') };
    } else if (params.has('email')) {
        return { type: 'email', name: params.get('email') };
    } else {
        return { type: 'NA', name: 'NA' };
    }
}

// Function to send resource click event to the server
function sendResourceClickToServer(resourceClicked) {
    // Only send if the resource is not NA
    if (resourceClicked.name === 'NA' || resourceClicked.type === 'NA') {
        console.log('Invalid resource, skipping click tracking.');
        return;
    }

    const userInfoCookie = getCookie('userInfo');
    if (!userInfoCookie) {
        console.error('No user info found, skipping click tracking.');
        return;
    }

    const userInfo = JSON.parse(userInfoCookie);
    const payload = {
        username: userInfo.username,
        resourceClicked: resourceClicked,
        tag: userInfo.tag
    };

    fetch(\`https://revenue-node-server.vercel.app/api/resource-click/\${userInfo.username}\`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Resource click info sent successfully:', data);
        sessionStorage.setItem(\`resourceClick_\${resourceClicked.name}\`, 'true');
    })
    .catch(error => {
        console.error('Error sending resource click info:', error);
    });
}

// Check if the resource click has already been sent
function isResourceClickAlreadyTracked(resourceClicked) {
    return sessionStorage.getItem(\`resourceClick_\${resourceClicked.name}\`) === 'true';
}

// Update the userInfo cookie with the resourceClicked parameter and track the resource click
window.addEventListener('DOMContentLoaded', () => {
    const resourceClicked = getResourceClicked();

    if (isResourceClickAlreadyTracked(resourceClicked)) {
        console.log(\`Resource click already tracked for: \${resourceClicked.name}\`);
        return;
    }

    let userInfoCookie = getCookie('userInfo');
    if (userInfoCookie) {
        let userInfo = JSON.parse(userInfoCookie);
        userInfo.resourceClicked = resourceClicked;
        setCookie('userInfo', JSON.stringify(userInfo), 30);
        sendResourceClickToServer(resourceClicked);
    } else {
        const userInfo = {
            resourceClicked: resourceClicked,
            username: customerUsername
        };
        setCookie('userInfo', JSON.stringify(userInfo), 30);
        sendResourceClickToServer(resourceClicked);
    }
});
</script>
`;

    const thankYouScript = `
<script>
// Function to get a cookie by name
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Function to set a cookie
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
}

// Function to send user info to the server after purchase
function sendPurchaseInfoToServer(userInfo) {
    const username = userInfo.username;
    if (!username) {
        console.error('Username not found in userInfo.');
        return;
    }

    const resourceClicked = userInfo.resourceClicked;
    if (!resourceClicked || !resourceClicked.name) {
        console.error('resourceClicked not found in userInfo.');
        return;
    }

    const payload = {
        username: userInfo.username,
        resourceClicked: resourceClicked,
        tag: userInfo.tag,
    };

    fetch(\`https://revenue-node-server.vercel.app/api/purchase/\${username}\`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Purchase info sent successfully:', data);
        userInfo.hasPurchased = true;
        setCookie('userInfo', JSON.stringify(userInfo), 30);
    })
    .catch((error) => {
        console.error('Error sending purchase info:', error);
    });
}

window.addEventListener('DOMContentLoaded', (event) => {
    const userInfoCookie = getCookie('userInfo');
    if (userInfoCookie) {
        const userInfo = JSON.parse(userInfoCookie);
        if (userInfo.hasPurchased) {
            console.log('User has already made a purchase, skipping request.');
            return;
        }
        sendPurchaseInfoToServer(userInfo);
    } else {
        console.log('No user info cookie found.');
    }
});
</script>
`;

    const copyToClipboard = (code, label) => {
        navigator.clipboard.writeText(code);
        setCopied(label);
        setTimeout(() => setCopied(''), 2000);
    };

    return (
        <div className="code-container">
            <h1>Code Blocks</h1>

            <div className="code-block">
                <h2>Tracker Script</h2>
                <pre>{trackerScript}</pre>
                <button onClick={() => copyToClipboard(trackerScript, 'trackerScript')}>
                    {copied === 'trackerScript' ? 'Copied!' : 'Copy'}
                </button>
            </div>

            <div className="code-block">
                <h2>Thank You Script</h2>
                <pre>{thankYouScript}</pre>
                <button onClick={() => copyToClipboard(thankYouScript, 'thankYouScript')}>
                    {copied === 'thankYouScript' ? 'Copied!' : 'Copy'}
                </button>
            </div>
        </div>
    );
};

export default Code;
