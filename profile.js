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

        document.getElementById("avatar").src = author.avatar.url || "https://via.placeholder.com/100";
        document.getElementById("banner").src = author.banner.url || "https://via.placeholder.com/500x150";
        document.getElementById("name").textContent = author.name;
        document.getElementById("bio").textContent = author.bio || "No bio available.";
        document.getElementById("email").textContent = author.email || "Not available";

        // ✅ Update Following & Followers Count
        document.getElementById("following-count").textContent = `Following: ${author._count?.following || 0}`;
        document.getElementById("followers-count").textContent = `Followers: ${author._count?.followers || 0}`;

        updateFollowButton(author.name);
    } catch (error) {
        alert("❌ Error fetching author profile.");
    }
}

// Function to Follow or Unfollow a User (Fix: Updates State Immediately)
async function toggleFollow() {
    const authorName = getQueryParam("id");
    if (!authorName) {
        alert("❌ Error: No author name found.");
        return;
    }

    const button = document.getElementById("follow-button");
    const isFollowing = button.textContent === "Unfollow";
    const action = isFollowing ? "unfollow" : "follow";
    const apiUrl = `${BASE_API_URL}/${encodeURIComponent(authorName.trim())}/${action}`;

    console.log(`🔗 Sending ${action.toUpperCase()} request to: ${apiUrl}`);

    try {
        const response = await fetch(apiUrl, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token").replace(/"/g, "")}`,
                "X-Noroff-API-Key": JSON.parse(localStorage.getItem("apiKey")),
                "Content-Type": "application/json"
            }
        });

        const responseData = await response.json();
        console.log(`✅ API Response:`, responseData);

        if (!response.ok) {
            console.error(`❌ Failed to ${action}:`, responseData);
            alert(`❌ Error: ${responseData.errors ? responseData.errors[0].message : "Unknown error"}`);
            return;
        }

        // ✅ Update button text immediately
        button.textContent = isFollowing ? "Follow" : "Unfollow";

        // ✅ Refresh the follow status to reflect the new state
        await updateFollowButton(authorName);

        // ✅ Update profile stats after following/unfollowing
        fetchAuthorProfile();

        alert(`✅ Successfully ${isFollowing ? "unfollowed" : "followed"} ${authorName}`);

    } catch (error) {
        console.error("🚨 Error updating follow status:", error);
        alert("❌ Error updating follow status. Check the console for details.");
    }
}

// Function to Update Follow Button Status (Ensures Correct State)
async function updateFollowButton(authorName) {
    const button = document.getElementById("follow-button");
    button.textContent = "Checking...";

    try {
        const response = await fetch(`${BASE_API_URL}/${encodeURIComponent(authorName)}?_following=true&_followers=true`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token").replace(/"/g, "")}`,
                "X-Noroff-API-Key": JSON.parse(localStorage.getItem("apiKey"))
            }
        });

        if (!response.ok) {
            console.error(`❌ Error checking follow status: ${response.status}`);
            button.textContent = "Follow"; // Default to Follow if error
            return;
        }

        const data = await response.json();
        console.log("✅ Follow status fetched:", data);

        if (data.data?.isFollowing) {
            button.textContent = "Unfollow";
        } else {
            button.textContent = "Follow";
        }
    } catch (error) {
        console.error("Error checking follow status:", error);
        button.textContent = "Follow"; // Default if an error occurs
    }
}

// Function to Fetch and Display All Posts by the Author
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

// Fetch Profile on Page Load
window.onload = async () => {
    await fetchAuthorProfile();
    await updateFollowButton(getQueryParam("id"));
};
