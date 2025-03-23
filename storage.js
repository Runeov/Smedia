// ✅ Function to Save Data to Local Storage
export function save(key, value) {
    console.log(`💾 Saving to localStorage: ${key}`, value);
    localStorage.setItem(key, JSON.stringify(value));
}

// ✅ Function to Retrieve Data from Local Storage
export function get(key) {
    console.log(`📦 Retrieving from localStorage: ${key}`);
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : null;
}

// ✅ Function to Remove Data from Local Storage
export function remove(key) {
    console.log(`🗑 Removing from localStorage: ${key}`);
    localStorage.removeItem(key);
}
