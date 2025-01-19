const { parse } = require("node-html-parser");
const cloudscraper = require("cloudscraper");
/**
 * Fetches the URL with a timeout
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options (headers, etc.)
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Response>} - The fetch response or an error if timeout occurs
 */
async function fetchWithTimeout(url, options, timeout = 10000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), timeout),
    ),
  ]);
}

/**
 * Check if a user is live on Kick.com
 * @param {string} username - The Kick.com username
 * @returns {Promise<boolean>} - True if the user is live, false otherwise
 */
async function isUserLiveOnKick(username) {
  const url = `https://kick.com/${username}`;

  const options = {
    uri: "https://website.com/",
    formData: { field1: "value", field2: 2 },
  };
  // Perform the fetch request with headers for better compatibility
  await cloudscraper.get(url, (error, response, body) => {
    if (error) {
      console.error("Error bypassing Cloudflare:", error);
    } else {
      console.log("Page content:", body);
    }
  });
}

module.exports = {
  isUserLiveOnKick,
};
