import { getAuthHeaders } from "./auth.js"; // ✅ Import authentication headers

// ✅ Function to Create a New Post
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

    // ✅ Process tags only if provided
    let tags = [];
    if (tagsInput) {
        tags = tagsInput.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0);
    }

    const postData = {
        title: title,
        body: body || null,
        tags: tags.length > 0 ? tags : undefined, // ✅ Only send if not empty
        media: imageUrl ? { url: imageUrl, alt: imageAlt || "Post image" } : null
    };

    console.log("📤 Sending post data:", postData);

    const headers = getAuthHeaders();
    if (!headers) {
        alert("⚠️ Missing authentication. Please log in.");
        return;
    }

    try {
        const response = await fetch("https://v2.api.noroff.dev/social/posts", {
            method: "POST",
            headers,
            body: JSON.stringify(postData)
        });

        const responseData = await response.json();
        console.log("✅ Post created successfully:", responseData);

        if (!response.ok) {
            throw new Error(responseData.errors ? responseData.errors[0].message : "Unknown error");
        }

        postResponse.style.display = "block";
        postResponse.innerHTML = `<strong>✅ Post Created Successfully!</strong><br>
                                  ID: ${responseData.data.id}<br>
                                  Title: ${responseData.data.title}`;

        // ✅ Clear form fields after successful post
        document.getElementById("createPostForm").reset();
    } catch (error) {
        console.error("❌ Error creating post:", error);
        postResponse.textContent = `❌ Error creating post: ${error.message}`;
        postResponse.style.display = "block";
    }
}
