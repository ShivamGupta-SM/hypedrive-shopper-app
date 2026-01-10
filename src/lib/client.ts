import Client, { Local, Environment } from "./api-client";

// Get the API base URL from environment or use local
const API_URL = import.meta.env.VITE_API_URL || Local;

// Auth data generator function - called on each request to get fresh token
function getAuthData() {
  const token = localStorage.getItem("auth_token");
  if (token) {
    console.log("[Auth] Token found, length:", token.length, "prefix:", token.substring(0, 30));
    return { authorization: `Bearer ${token}` };
  }
  console.log("[Auth] No token found in localStorage");
  return undefined;
}

// Create a singleton client instance with auth generator
export const apiClient = new Client(API_URL, {
  auth: getAuthData,
});

// Helper to get authenticated client (for backwards compatibility)
export function getAuthenticatedClient() {
  return apiClient;
}

// Re-export types for convenience
export * from "./api-client";
export { Environment };
