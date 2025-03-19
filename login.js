const API_SOCIAL_URL = 'https://v2.api.noroff.dev/auth/login';
const API_KEY_URL = 'https://v2.api.noroff.dev/auth/create-api-key';

// Local Storage Functions
function save(key, value) {
    console.log(`Saving to localStorage: ${key}`, value);
    localStorage.setItem(key, JSON.stringify(value));
}

function get(key) {
    console.log(`Retrieving from localStorage: ${key}`);
    return JSON.parse(localStorage.getItem(key));
}

function remove(key) {
    console.log(`Removing from localStorage: ${key}`);
    localStorage.removeItem(key);
}

// Function to add an event listener to the login form
function loginListener() {
    const form = document.querySelector('form');

    if (form) {
        console.log('Login form found, adding event listener.');
        form.addEventListener('submit', handleLogin);
    } else {
        console.error('Login form not found.');
    }
}

// Function to handle form submission
async function handleLogin(event) {
    event.preventDefault(); // Prevent default form submission

    const form = event.target;
    const data = new FormData(form);
    const email = data.get('email');
    const password = data.get('password');

    console.log('Attempting login with:', { email, password: '*****' }); // Mask password in logs

    try {
        const bodyData = { email, password };
        console.log('Sending login request to:', API_SOCIAL_URL);

        const response = await fetch(API_SOCIAL_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bodyData)
        });

        console.log('Login response received:', response);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Login failed. Response:', errorText);
            throw new Error(`Login failed. Status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log('Login successful! Response data:', responseData);

        const { accessToken, name } = responseData.data;

        if (!accessToken) {
            console.error('No access token received.');
            throw new Error('No access token provided in response.');
        }

        save('token', accessToken);
        save('user', name);
        console.log('Token and user data saved successfully.');

        // Test API authorization immediately after login
        await testAuthorization();

        location.href = '/dashboard.html/'; // Redirect user after successful login
    } catch (error) {
        console.error('Login error:', error);
        alert(error.message);
    }
}

// Function to test authorization by requesting an API key
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
                'Authorization': `Bearer ${token}` // Attach token for authentication
            },
            body: JSON.stringify({}) // Some APIs require an empty object in POST requests
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
