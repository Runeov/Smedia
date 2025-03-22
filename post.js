const BASE_API_URL = "https://v2.api.noroff.dev/social/posts";

// Function to Get Query Parameters from URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param) ? decodeURIComponent(urlParams.get(param).trim()) : null;
}

// Function to Get Auth Headers
function getAuthHeaders() {
    const accessToken = localStorage.getItem("token");
    const apiKey = localStorage.getItem("apiKey");

    if (!accessToken || !apiKey) {
        alert("⚠️ You are not authenticated. Redirecting to login.");
        window.location.href = "/index.html";
        return null;
    }

    return {
        "Authorization": `Bearer ${accessToken.replace(/"/g, "")}`,
        "X-Noroff-API-Key": JSON.parse(apiKey),
        "Content-Type": "application/json"
    };
}

// Function to Validate Image URL
function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch (error) {
        return false;
    }
}

// Function to Fetch Post Details
async function fetchPostDetails() {
    const postId = getQueryParam("id");
    if (!postId) {
        alert("❌ No post ID found.");
        return;
    }

    const response = await fetch(`${BASE_API_URL}/${postId}`, {
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        alert(`❌ Error fetching post: ${response.status}`);
        return;
    }

    const post = (await response.json()).data;

    document.getElementById("postTitle").value = post.title;
    document.getElementById("postBody").value = post.body;
    document.getElementById("postTags").value = post.tags.join(", ");
    document.getElementById("postImageUrl").value = post.media?.url || "";
    document.getElementById("postImageAlt").value = post.media?.alt || "";

    document.getElementById("updatePost").addEventListener("click", () => updatePost(postId));
}

// Function to Update Post
async function updatePost(postId) {
    if (!postId) return;

    const title = document.getElementById("postTitle").value.trim();
    const body = document.getElementById("postBody").value.trim();
    const tags = document.getElementById("postTags").value.split(",").map(tag => tag.trim());
    const imageUrl = document.getElementById("postImageUrl").value.trim();
    const imageAlt = document.getElementById("postImageAlt").value.trim();
    const responseMessage = document.getElementById("responseMessage");

    // Validate Image URL (If Provided)
    if (imageUrl && !isValidUrl(imageUrl)) {
        alert("❌ Invalid Image URL! Please enter a valid publicly accessible image URL.");
        return;
    }

    const updatedData = {
        title: title,
        body: body || null,
        tags: tags.length ? tags : null,
        media: imageUrl ? { url: imageUrl, alt: imageAlt || "Image" } : null
    };

    console.log("📤 Updating post:", updatedData);

    try {
        const response = await fetch(`${BASE_API_URL}/${postId}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(updatedData)
        });

        const responseData = await response.json();
        console.log("✅ Update Response:", responseData);

        if (!response.ok) {
            throw new Error(responseData.errors ? responseData.errors[0].message : "Unknown error");
        }

        responseMessage.textContent = "✅ Post updated successfully!";
    } catch (error) {
        alert(`❌ Error updating post: ${error.message}`);
    }
}

// Attach Event Listeners
window.onload = fetchPostDetails;
