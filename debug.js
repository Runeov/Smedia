const NOROFF_API_URL = "https://v2.api.noroff.dev/social/posts";

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

// Function to Fetch Posts
// Function to Fetch and Display Posts
async function fetchPosts() {
    const accessToken = get("token");
    const apiKey = get("apiKey");

    if (!accessToken || !apiKey) {
        console.error("Missing token or API key. Redirecting to login.");
        document.getElementById("status").textContent = "Not authenticated. Redirecting...";
        alert("You are not authenticated. Redirecting to login.");
        setTimeout(() => { window.location.href = "/index.html"; }, 2000);
        return;
    }

    console.log("Fetching posts with token and API key...");

    const options = {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Noroff-API-Key": apiKey
        }
    };

    try {
        console.log("Sending GET request to:", NOROFF_API_URL);

        const response = await fetch(NOROFF_API_URL, options);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Failed to fetch posts. Status: ${response.status}`, errorText);
            document.getElementById("status").textContent = `Error: ${response.status}`;
            throw new Error(`Error fetching posts. Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Posts fetched successfully:", data);

        let posts = data.data || data; // Adjust depending on API response format

        if (!Array.isArray(posts)) {
            console.error("Unexpected response format. Expected an array, got:", posts);
            document.getElementById("responseLog").textContent = "Error: Unexpected API response format.";
            return;
        }

        displayPosts(posts);
    } catch (error) {
        console.error("Error fetching posts:", error);
        document.getElementById("status").textContent = "Error fetching posts.";
        document.getElementById("responseLog").textContent = "Error: " + error.message;
    }
}

// Function to Display Posts in a Styled Div
function displayPosts(posts) {
    const postsContainer = document.getElementById("responseLog");
    postsContainer.innerHTML = ""; // Clear previous posts

    if (posts.length === 0) {
        postsContainer.innerHTML = "<p>No posts available.</p>";
        return;
    }

    posts.forEach(post => {
        const postElement = document.createElement("div");
        postElement.classList.add("post");

        postElement.innerHTML = `
            <h3>${post.title || "Untitled Post"}</h3>
            <p>${post.body || "No content available."}</p>
            <small>By: ${post.author?.name || "Unknown"}</small>
        `;

        postsContainer.appendChild(postElement);
    });

    document.getElementById("status").textContent = "Posts loaded successfully!";
}

// Attach Event Listener to Fetch Posts Button
document.getElementById("testApiButton").addEventListener("click", fetchPosts);