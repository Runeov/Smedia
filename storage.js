// storage.js
export function save(key, value) {
    console.log(`Saving to localStorage: ${key}`, value);
    localStorage.setItem(key, JSON.stringify(value));
}

export function get(key) {
    console.log(`Retrieving from localStorage: ${key}`);
    return JSON.parse(localStorage.getItem(key));
}

export function remove(key) {
    console.log(`Removing from localStorage: ${key}`);
    localStorage.removeItem(key);
}
