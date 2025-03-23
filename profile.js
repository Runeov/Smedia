const BASE_API_URL = "https://v2.api.noroff.dev/social/profiles";

// Function to Get Query Parameters from URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param) ? decodeURIComponent(urlParams.get(param).trim()) : null;
}

// Function to Fetch Author Profile (Includes Followers & Following)
async function fetchAuthorProfile() {
    console.log("🔍 Fetching profile...");

    const authorName = getQueryParam("id");
    console.log(`📌 Extracted author name from URL:`, authorName);

    if (!authorName) {
        alert("⚠️ No valid author name provided. Redirecting...");
        window.location.href = "/index.html";
        return;
    }

    const accessToken = localStorage.getItem("token");
    const apiKey = localStorage.getItem("apiKey");

    if (!accessToken || !apiKey) {
        alert("⚠️ You are not authenticated. Redirecting...");
        window.location.href = "/index.html";
        return;
    }

    const profileApiUrl = `${BASE_API_URL}/${encodeURIComponent(authorName)}?_following=true&_followers=true`;
    console.log(`🔗 Fetching author profile from: ${profileApiUrl}`);

    try {
        const response = await fetch(profileApiUrl, {
            headers: {
                Authorization: `Bearer ${accessToken.replace(/"/g, "")}`,
                "X-Noroff-API-Key": JSON.parse(apiKey)
            }
        });

        if (!response.ok) {
            alert(`⚠️ Error fetching profile: ${response.status}`);
            return;
        }

        const author = (await response.json()).data;
        console.log("✅ Author profile fetched:", author);

        document.getElementById("avatar").src = author.avatar?.url || "https://via.placeholder.com/100";
        document.getElementById("banner").src = author.banner?.url || "https://via.placeholder.com/500x150";
        document.getElementById("name").textContent = author.name;
        document.getElementById("bio").textContent = author.bio || "No bio available.";
        document.getElementById("email").textContent = author.email || "Not available";

        // ✅ Update Following & Followers Count
        document.getElementById("following-count").textContent = `Following: ${author._count?.following || 0}`;
        document.getElementById("followers-count").textContent = `Followers: ${author._count?.followers || 0}`;

        updateFollowButtons(author);
    } catch (error) {
        alert("❌ Error fetching author profile.");
    }
}

// ✅ Function to Follow a User
async function followUser() {
    await toggleFollowAction("follow");
}

// ✅ Function to Unfollow a User
async function unfollowUser() {
    await toggleFollowAction("unfollow");
}

// ✅ Function to Handle Follow/Unfollow Requests
async function toggleFollowAction(action) {
    const authorName = getQueryParam("id");
    if (!authorName) {
        alert("❌ Error: No author name found.");
        return;
    }

    const apiUrl = `${BASE_API_URL}/${encodeURIComponent(authorName.trim())}/${action}`;
    console.log(`🔗 Sending ${action.toUpperCase()} request to: ${apiUrl}`);

    try {
        const response = await fetch(apiUrl, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token").replace(/"/g, "")}`,
                "X-Noroff-API-Key": JSON.parse(localStorage.getItem("apiKey")) ,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`❌ Failed to ${action}: ${response.status}`);
        }

        // ✅ Refresh profile data to update follower count
        fetchAuthorProfile();

        alert(`✅ Successfully ${action === "follow" ? "followed" : "unfollowed"} ${authorName}`);
    } catch (error) {
        console.error("🚨 Error updating follow status:", error);
        alert("❌ Error updating follow status. Check the console for details.");
    }
}

// ✅ Function to Update Follow & Unfollow Buttons
async function updateFollowButtons(author) {
    const followButton = document.getElementById("follow-button");
    const unfollowButton = document.getElementById("unfollow-button");

    if (!followButton || !unfollowButton) {
        console.error("❌ Follow/Unfollow buttons not found in DOM.");
        return;
    }

    followButton.onclick = followUser;
    unfollowButton.onclick = unfollowUser;
}

// ✅ Function to Fetch and Display All Posts by the Author
async function fetchAuthorPosts() {
    console.log("📌 Fetching author's posts...");

    const authorName = getQueryParam("id");
    if (!authorName) {
        alert("❌ No author name provided.");
        return;
    }

    const accessToken = localStorage.getItem("token");
    const apiKey = localStorage.getItem("apiKey");

    const postsApiUrl = `${BASE_API_URL}/${encodeURIComponent(authorName)}/posts?_author=true&_comments=true&_reactions=true`;
    console.log(`🔗 Fetching posts from: ${postsApiUrl}`);

    try {
        const response = await fetch(postsApiUrl, {
            headers: {
                Authorization: `Bearer ${accessToken.replace(/"/g, "")}`,
                "X-Noroff-API-Key": JSON.parse(apiKey)
            }
        });

        if (!response.ok) {
            alert(`❌ Error fetching posts: ${response.status}`);
            return;
        }

        const posts = (await response.json()).data;
        console.log("✅ Posts fetched:", posts);

        const postsContainer = document.getElementById("posts-container");
        const postsList = document.getElementById("posts-list");

        postsList.innerHTML = "";
        postsContainer.style.display = "block";

        if (!posts.length) {
            postsList.innerHTML = "<p>No posts available.</p>";
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
            postsList.appendChild(postElement);
        });
    } catch (error) {
        alert("❌ Error fetching posts.");
    }
}

// ✅ Fetch Profile on Page Load
window.onload = async () => {
    await fetchAuthorProfile();
};
