import { BASE_API_URL, AUTHOR_API_URL } from "./adress.js";  // ✅ Fixed spelling
import { save } from "./storage.js";

const REGISTER_API_URL = "https://v2.api.noroff.dev/auth/register";

// Function to Validate Email (Must Be `stud.noroff.no`)
function isValidNoroffEmail(email) {
    return /^[a-zA-Z0-9._%+-]+@stud\.noroff\.no$/.test(email);
}

// Function to Handle Registration
async function handleRegister(event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const bio = document.getElementById("bio").value.trim();
    const avatarUrl = document.getElementById("avatarUrl").value.trim();
    const bannerUrl = document.getElementById("bannerUrl").value.trim();
    const errorMessage = document.getElementById("errorMessage");

    if (!isValidNoroffEmail(email)) {
        errorMessage.textContent = "❌ Email must be a valid stud.noroff.no address.";
        return;
    }
    if (password.length < 8) {
        errorMessage.textContent = "❌ Password must be at least 8 characters long.";
        return;
    }

    const registrationData = { name, email, password };
    if (bio) registrationData.bio = bio;
    if (avatarUrl) registrationData.avatar = { url: avatarUrl, alt: "User avatar" };
    if (bannerUrl) registrationData.banner = { url: bannerUrl, alt: "User banner" };

    console.log("📤 Sending registration data:", registrationData);

    try {
        const response = await fetch(REGISTER_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(registrationData)
        });

        const responseData = await response.json();
        console.log("✅ Registration Response:", responseData);

        if (!response.ok) {
            throw new Error(responseData.errors ? responseData.errors[0].message : "Unknown error");
        }

        save("user", responseData.data);
        alert("✅ Registration successful! You can now log in.");
        window.location.href = "index.html";

    } catch (error) {
        errorMessage.textContent = `❌ Error registering: ${error.message}`;
    }
}

document.getElementById("registerForm").addEventListener("submit", handleRegister);
