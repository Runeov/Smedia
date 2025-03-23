import { get } from "./storage.js"; // ✅ Import storage functions

// ✅ Function to Get Auth Headers for API Requests
export function getAuthHeaders() {
    const accessToken = get("token");
    const apiKey = get("apiKey");

    if (!accessToken || !apiKey) {
        console.error("❌ Missing authentication details.");
        return null;
    }

    return {
        Authorization: `Bearer ${accessToken}`,
        "X-Noroff-API-Key": apiKey,
        "Content-Type": "application/json"
    };
}
