const BASE_API_URL = "https://v2.api.noroff.dev/social/posts";

// Function to Get Token and API Key
export function getAuthHeaders() {
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

// Function to Create a New Post
export async function createPost(event) {
    event.preventDefault(); // Prevent default form submission

    const title = document.getElementById("postTitle").value.trim();
    const body = document.getElementById("postBody").value.trim();
    const tagsInput = document.getElementById("postTags").value.trim();
    const imageUrl = document.getElementById("postImageUrl").value.trim();
    const imageAlt = document.getElementById("postImageAlt").value.trim();
    const postResponse = document.getElementById("postResponse");

    if (!title) {
        alert("❌ Title is required.");
        return;
    }

    const tags = tagsInput ? tagsInput.split(",").map(tag => tag.trim()) : [];

    const postData = {
        title: title,
        body: body || null,
        tags: tags.length ? tags : null,
        media: imageUrl ? { url: imageUrl, alt: imageAlt || "Image" } : null
    };

    console.log("📤 Sending post data:", postData);

    try {
        const response = await fetch(BASE_API_URL, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(postData)
        });

        const responseData = await response.json();
        console.log("✅ Post Response:", responseData);

        if (!response.ok) {
            alert(`❌ Error creating post: ${responseData.errors ? responseData.errors[0].message : "Unknown error"}`);
            return;
        }

        // Display success message
        postResponse.style.display = "block";
        postResponse.innerHTML = `<strong>✅ Post Created Successfully!</strong><br>ID: ${responseData.data.id}<br>Title: ${responseData.data.title}`;

        // Clear the form after success
        document.getElementById("createPostForm").reset();

    } catch (error) {
        console.error("🚨 Error creating post:", error);
        alert("❌ Failed to create post. Check the console for details.");
    }
}
