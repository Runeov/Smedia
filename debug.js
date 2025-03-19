const BASE_API_URL = "https://v2.api.noroff.dev/social/posts";
const AUTHOR_API_URL = "https://v2.api.noroff.dev/social/profiles"; // API for author details

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

// Function to Fetch Posts from API
async function fetchPosts(queryType = "", queryValue = "") {
    const accessToken = get("token");
    const apiKey = get("apiKey");

    if (!accessToken || !apiKey) {
        console.error("Missing token or API key. Redirecting to login.");
        document.getElementById("status").textContent = "Not authenticated. Redirecting...";
        alert("You are not authenticated. Redirecting to login.");
        setTimeout(() => { window.location.href = "/index.html"; }, 2000);
        return;
    }

    let apiUrl = BASE_API_URL;

    // Adjust API endpoint based on search type
    if (queryType === "id") {
        apiUrl += `/${queryValue}?_author=true&_comments=true&_reactions=true`; // Fetch extra data
    } else if (queryType === "_tag") {
        apiUrl += `?_tag=${encodeURIComponent(queryValue)}&_author=true&_comments=true&_reactions=true`; // Include extra data
    } else if (queryType === "title" || queryType === "body") {
        apiUrl = `${BASE_API_URL}/search?q=${encodeURIComponent(queryValue)}&_author=true&_comments=true&_reactions=true`; // Include extra data
    } else if (queryType === "author") {
        apiUrl = `${AUTHOR_API_URL}/${queryValue}?_posts=true&_author=true&_comments=true&_reactions=true`; // Fetch author's posts with extra data
    }

    console.log(`Fetching posts with query: ${queryType} = ${queryValue || "All Posts"}...`);
    console.log(`Final API Request URL: ${apiUrl}`);

    const options = {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Noroff-API-Key": apiKey
        }
    };

    try {
        console.log("Sending GET request to:", apiUrl);

        const response = await fetch(apiUrl, options);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Failed to fetch posts. Status: ${response.status}`, errorText);
            document.getElementById("status").textContent = `Error: ${response.status}`;
            throw new Error(`Error fetching posts. Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Posts fetched successfully:", data);

        let posts = data.data || data; // Adjust depending on API response format

        // Ensure response is an array before processing
        if (!Array.isArray(posts)) {
            if (queryType === "id" || queryType === "author") {
                posts = [posts]; // Convert single object to array for display
            } else {
                console.error("Unexpected response format. Expected an array, got:", posts);
                document.getElementById("responseLog").textContent = "Error: Unexpected API response format.";
                return;
            }
        }

        displayPosts(posts);
    } catch (error) {
        console.error("Error fetching posts:", error);
        document.getElementById("status").textContent = "Error fetching posts.";
        document.getElementById("responseLog").textContent = "Error: " + error.message;
    }
}

// Function to Display Posts with Correct Clickable Author Profile Link
function displayPosts(posts) {
    const postsContainer = document.getElementById("responseLog");

    // Clear previous content before displaying new results
    postsContainer.innerHTML = "";
    document.getElementById("status").textContent = "Loading new posts...";

    if (posts.length === 0) {
        postsContainer.innerHTML = "<p>No posts available.</p>";
        document.getElementById("status").textContent = "No posts found.";
        return;
    }

    posts.forEach(post => {
        const postElement = document.createElement("div");
        postElement.classList.add("post");

        // Ensure the author name exists before creating the profile link
        let authorProfileLink = "Unknown";
        if (post.author?.name) {
            const encodedAuthorName = encodeURIComponent(post.author.name.trim()); // Ensure proper encoding
            authorProfileLink = `<a href="profile.html?id=${encodedAuthorName}" 
                style="color: blue; text-decoration: underline;">
                ${post.author.name}
            </a>`;
        }

        postElement.innerHTML = `
            <h3>${post.title || "Untitled Post"}</h3>
            <p>${post.body || "No content available."}</p>
            <p><strong>By:</strong> ${authorProfileLink}</p>
            <p><strong>Reactions:</strong> ${post._count?.reactions || 0}</p>
            <p><strong>Comments:</strong> ${post._count?.comments || 0}</p>
        `;

        postsContainer.appendChild(postElement);
    });

    document.getElementById("status").textContent = "Posts loaded successfully!";
}

// Function to Get User Search Criteria and Fetch Posts
function searchByCriteria() {
    const searchType = document.getElementById("searchType").value;
    const searchQuery = document.getElementById("searchQuery").value.trim();

    if (!searchQuery) {
        alert("Please enter a value to search.");
        return;
    }

    fetchPosts(searchType, searchQuery);
}

// Function to Clear Storage and Logout
function clearStorageAndLogout() {
    remove("token");
    remove("apiKey");
    remove("user");
    console.log("Storage cleared. Redirecting to login...");
    alert("Storage cleared. Redirecting to login.");
    window.location.href = "/index.html";
}

// Attach Event Listeners
document.getElementById("testApiButton").addEventListener("click", () => fetchPosts());
document.getElementById("searchButton").addEventListener("click", searchByCriteria);
document.getElementById("clearStorageButton").addEventListener("click", clearStorageAndLogout);
