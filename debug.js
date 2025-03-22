import { save, get, remove } from "./storage.js";
import { createPost, getAuthHeaders } from "./createPost.js";

import { BASE_API_URL, AUTHOR_API_URL } from "./adress.js";

// Attach Event Listener for Post Creation
document.getElementById("createPostForm").addEventListener("submit", createPost);

// ✅ Fetch Posts Function
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

    if (queryType === "id") {
        apiUrl += `/${queryValue}?_author=true&_comments=true&_reactions=true`;
    } else if (queryType === "_tag") {
        apiUrl += `?_tag=${encodeURIComponent(queryValue)}&_author=true&_comments=true&_reactions=true`;
    } else if (queryType === "title" || queryType === "body") {
        apiUrl = `${BASE_API_URL}/search?q=${encodeURIComponent(queryValue)}&_author=true&_comments=true&_reactions=true`;
    } else if (queryType === "author") {
        apiUrl = `${AUTHOR_API_URL}/${queryValue}?_posts=true&_author=true&_comments=true&_reactions=true`;
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

        let posts = data.data || data;

        if (!Array.isArray(posts)) {
            if (queryType === "id" || queryType === "author") {
                posts = [posts];
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

// Function to Get Search Criteria and Fetch Posts
function searchByCriteria() {
    const searchType = document.getElementById("searchType").value;
    const searchQuery = document.getElementById("searchQuery").value.trim();

    if (!searchQuery) {
        alert("⚠️ Please enter a search value.");
        return;
    }

    console.log(`🔍 Searching for ${searchType}: ${searchQuery}`);
    fetchPosts(searchType, searchQuery);
}

// Attach Event Listeners
document.getElementById("searchButton").addEventListener("click", searchByCriteria);
// ✅ Display Posts Function
function displayPosts(posts) {
    const postsContainer = document.getElementById("responseLog");
    postsContainer.innerHTML = "";

    if (!posts.length) {
        postsContainer.innerHTML = "<p>No posts available.</p>";
        return;
    }

    posts.forEach(post => {
        const postElement = document.createElement("div");
        postElement.classList.add("post");
        postElement.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.body}</p>
            <small>💬 ${post._count?.comments || 0} Comments | ❤️ ${post._count?.reactions || 0} Reactions</small>
        `;

        postElement.style.cursor = "pointer";
        postElement.style.transition = "background-color 0.3s ease";
        postElement.addEventListener("mouseenter", () => {
            postElement.style.backgroundColor = "#e8f4ff";
        });
        postElement.addEventListener("mouseleave", () => {
            postElement.style.backgroundColor = "white";
        });

        postElement.addEventListener("click", () => {
            window.open(`post.html?id=${post.id}`, "_blank");
        });

        postsContainer.appendChild(postElement);
    });
}

// ✅ Clear Storage & Logout Function
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
