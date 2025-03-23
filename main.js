import { BASE_API_URL, AUTHOR_API_URL } from "./adress.js"; // ✅ Import API URLs
import { save, get, remove } from "./storage.js"; // ✅ Import storage functions
import { getAuthHeaders } from "./auth.js"; // ✅ Import authentication headers
import { createPost } from "./createPost.js"; // ✅ Import createPost function

// Function to Fetch Posts from API
async function fetchPosts(queryType = "", queryValue = "") {
    const accessToken = get("token");
    const apiKey = get("apiKey");

    if (!accessToken || !apiKey) {
        document.getElementById("status").textContent = "Not authenticated. Redirecting...";
        alert("You are not authenticated. Redirecting to login.");
        setTimeout(() => { window.location.href = "/index.html"; }, 2000);
        return;
    }

    let apiUrl = BASE_API_URL;

    // Adjust API endpoint based on search type
    if (queryType === "id") {
        apiUrl += `/${queryValue}?_author=true&_comments=true&_reactions=true`;
    } else if (queryType === "_tag") {
        apiUrl += `?_tag=${encodeURIComponent(queryValue)}&_author=true&_comments=true&_reactions=true`;
    } else if (queryType === "title" || queryType === "body") {
        apiUrl = `${BASE_API_URL}/search?q=${encodeURIComponent(queryValue)}&_author=true&_comments=true&_reactions=true`;
    } else if (queryType === "author") {
        apiUrl = `${AUTHOR_API_URL}/${queryValue}?_posts=true&_author=true&_comments=true&_reactions=true`;
    } else {
        apiUrl += "?_author=true&_comments=true&_reactions=true"; // ✅ Default to fetching all posts with extra data
    }

    try {
        const response = await fetch(apiUrl, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "X-Noroff-API-Key": apiKey
            }
        });

        if (!response.ok) {
            throw new Error(`Error fetching posts. Status: ${response.status}`);
        }

        const data = await response.json();
        let posts = data.data || data;

        // Ensure response is an array before processing
        if (!Array.isArray(posts)) {
            if (queryType === "id" || queryType === "author") {
                posts = [posts];
            } else {
                document.getElementById("responseLog").textContent = "Error: Unexpected API response format.";
                return;
            }
        }

        displayPosts(posts);
    } catch (error) {
        document.getElementById("status").textContent = "Error fetching posts.";
        document.getElementById("responseLog").textContent = "Error: " + error.message;
    }
}

// Function to Display Posts with Clickable Links
function displayPosts(posts) {
    const postsContainer = document.getElementById("responseLog");
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
        postElement.style.cursor = "pointer";
        postElement.style.transition = "background-color 0.3s ease";

        // Hover effect
        postElement.addEventListener("mouseenter", () => {
            postElement.style.backgroundColor = "#e8f4ff";
        });
        postElement.addEventListener("mouseleave", () => {
            postElement.style.backgroundColor = "white";
        });

        // Redirect to post page
        postElement.addEventListener("click", () => {
            window.location.href = `post.html?id=${post.id}`;
        });

        // Ensure the author name exists before creating the profile link
        let authorProfileLink = "Unknown";
        if (post.author?.name) {
            const encodedAuthorName = encodeURIComponent(post.author.name.trim());
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

// Function to Get Search Criteria and Fetch Posts
function searchByCriteria() {
    const searchType = document.getElementById("searchType").value;
    const searchQuery = document.getElementById("searchQuery").value.trim();

    if (!searchQuery) {
        alert("⚠️ Please enter a search value.");
        return;
    }

    fetchPosts(searchType, searchQuery);
}

// Function to Clear Storage and Logout
function clearStorageAndLogout() {
    remove("token");
    remove("apiKey");
    remove("user");
    alert("✅ Storage cleared. Redirecting to login.");
    window.location.href = "index.html";
}

// Attach Event Listeners When DOM is Fully Loaded
document.addEventListener("DOMContentLoaded", () => {
    const testApiButton = document.getElementById("testApiButton");
    const searchButton = document.getElementById("searchButton");
    const clearStorageButton = document.getElementById("clearStorageButton");
    const createPostForm = document.getElementById("createPostForm");

    if (testApiButton) {
        testApiButton.addEventListener("click", () => fetchPosts());
    }

    if (searchButton) {
        searchButton.addEventListener("click", searchByCriteria);
    }

    if (clearStorageButton) {
        clearStorageButton.addEventListener("click", clearStorageAndLogout);
    }

    if (createPostForm) {
        createPostForm.addEventListener("submit", createPost);
    }
});

// Function to Redirect to My Profile
function goToMyProfile() {
    const user = get("user"); // Retrieve logged-in username from local storage
    if (!user) {
        alert("❌ No user data found. Please log in.");
        return;
    }

    const encodedUsername = encodeURIComponent(user.trim()); // Encode to handle spaces/special characters
    window.location.href = `profile.html?id=${encodedUsername}`;
}

// Attach Event Listener to "My Profile" Button
document.addEventListener("DOMContentLoaded", () => {
    const myProfileButton = document.getElementById("myProfileButton");
    if (myProfileButton) {
        myProfileButton.addEventListener("click", goToMyProfile);
    } else {
        console.error("❌ My Profile button not found in DOM.");
    }
});
