const API_SOCIAL_URL = 'https://v2.api.noroff.dev/auth/login';
const API_KEY_URL = 'https://v2.api.noroff.dev/auth/create-api-key';

/**
 * @description Saves a key-value pair to localStorage.
 * @param {string} key - The name of the key to store.
 * @param {any} value - The value to be stored (automatically converted to JSON).
 */
function save(key, value) {
    console.log(`Saving to localStorage: ${key}`, value);
    localStorage.setItem(key, JSON.stringify(value));
}

/**
 * @description Retrieves a value from localStorage.
 * @param {string} key - The key of the stored value.
 * @returns {any} The retrieved value, parsed from JSON.
 */
function get(key) {
    console.log(`Retrieving from localStorage: ${key}`);
    return JSON.parse(localStorage.getItem(key));
}

/**
 * @description Removes a key-value pair from localStorage.
 * @param {string} key - The key to remove.
 */
function remove(key) {
    console.log(`Removing from localStorage: ${key}`);
    localStorage.removeItem(key);
}

/**
 * @description Adds an event listener to the login form to handle user authentication.
 */
function loginListener() {
    const form = document.querySelector('form');

    if (form) {
        console.log('Login form found, adding event listener.');
        form.addEventListener('submit', handleLogin);
    } else {
        console.error('Login form not found.');
    }
}

/**
 * @description Handles user login by sending credentials to the API.
 * @param {Event} event - The form submit event.
 */
async function handleLogin(event) {
    event.preventDefault();

    const form = event.target;
    const data = new FormData(form);
    const email = data.get('email');
    const password = data.get('password');

    console.log('Attempting login with:', { email, password: '*****' });

    try {
        const bodyData = { email, password };
        const response = await fetch(API_SOCIAL_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyData)
        });

        if (!response.ok) {
            throw new Error('Login failed. Check your credentials.');
        }

        const responseData = await response.json();
        console.log('Login successful!', responseData);

        const { accessToken, name } = responseData.data;

        if (!accessToken) {
            throw new Error('No access token received.');
        }

        save('token', accessToken);
        save('user', name);

        console.log('Token and user data saved successfully.');

        // Fetch API Key
        const apiKeyResponse = await fetch(API_KEY_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify({})
        });

        if (!apiKeyResponse.ok) {
            throw new Error(`API Key request failed. Status: ${apiKeyResponse.status}`);
        }

        const apiKeyData = await apiKeyResponse.json();
        const apiKey = apiKeyData.data.key;

        save('apiKey', apiKey);
        console.log("API Key stored:", apiKey);

        location.href = "main.html"; // Redirect after successful login
    } catch (error) {
        console.error('Login error:', error);
        alert(error.message);
    }
}

/**
 * @description Tests if the stored token is valid by attempting to fetch an API key.
 */
async function testAuthorization() {
    const token = get('token');

    if (!token) {
        console.error('Authorization test failed: No token found.');
        alert('Authorization test failed: No token found.');
        return;
    }

    console.log('Retrieved token:', token);

    try {
        console.log('Sending authorization request to:', API_KEY_URL);

        const response = await fetch(API_KEY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({})
        });

        console.log('Authorization response received:', response);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Authorization failed. Response:', errorText);
            throw new Error(`Authorization failed. Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Authorization successful! API Key response:', data);
        alert('Authorization successful! Check console for API key response.');

    } catch (error) {
        console.error('Authorization test failed:', error);
        alert('Authorization test failed. Check console for details.');
    }
}

// Initialize login listener on page load
window.onload = () => {
    console.log('Page loaded, initializing login listener.');
    loginListener();
};
