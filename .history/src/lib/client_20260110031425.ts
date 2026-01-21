products page nahi hoga shopper k liyeimport Client, { Local, Environment } from "./api-client";

// Get the API base URL from environment or use local
const API_URL = import.meta.env.VITE_API_URL || Local;

// Create a singleton client instance
export const apiClient = new Client(API_URL, {
  auth: {
    authorization: localStorage.getItem("auth_token") || undefined,
  },
});

// Helper to get authenticated client
export function getAuthenticatedClient() {
  const token = localStorage.getItem("auth_token");
  if (token) {
    return apiClient.with({
      auth: { authorization: `Bearer ${token}` },
    });
  }
  return apiClient;
}

// Re-export types for convenience
export * from "./api-client";
export { Environment };
