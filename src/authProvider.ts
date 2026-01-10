import type { AuthProvider } from "@refinedev/core";
import { apiClient } from "./lib/client";

export const TOKEN_KEY = "auth_token";
export const USER_KEY = "auth_user";
export const SHOPPER_KEY = "auth_shopper";

interface StoredUser {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface StoredShopper {
  id: string;
  firstName: string;
  lastName: string;
  kycStatus: string;
}

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      const response = await apiClient.auth.signInEmail({ email, password });

      if (response.token && response.user) {
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));

        return {
          success: true,
          redirectTo: "/",
        };
      }

      return {
        success: false,
        error: {
          name: "LoginError",
          message: "Invalid email or password",
        },
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Login failed";
      return {
        success: false,
        error: {
          name: "LoginError",
          message,
        },
      };
    }
  },

  register: async ({ email, password, name }) => {
    try {
      const response = await apiClient.auth.signUpEmail({
        email,
        password,
        name
      });

      if (response.token && response.user) {
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));

        return {
          success: true,
          redirectTo: "/settings",
        };
      }

      return {
        success: false,
        error: {
          name: "RegisterError",
          message: "Registration failed",
        },
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Registration failed";
      return {
        success: false,
        error: {
          name: "RegisterError",
          message,
        },
      };
    }
  },

  forgotPassword: async ({ email }) => {
    try {
      const response = await apiClient.auth.forgotPassword({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (response.success) {
        return {
          success: true,
        };
      }

      return {
        success: false,
        error: {
          name: "ForgotPasswordError",
          message: "Failed to send reset email",
        },
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to send reset email";
      return {
        success: false,
        error: {
          name: "ForgotPasswordError",
          message,
        },
      };
    }
  },

  updatePassword: async ({ token, newPassword }) => {
    try {
      const response = await apiClient.auth.resetPassword({
        token,
        newPassword
      });

      if (response.success) {
        return {
          success: true,
          redirectTo: "/login",
        };
      }

      return {
        success: false,
        error: {
          name: "UpdatePasswordError",
          message: "Failed to reset password",
        },
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to reset password";
      return {
        success: false,
        error: {
          name: "UpdatePasswordError",
          message,
        },
      };
    }
  },

  logout: async () => {
    try {
      await apiClient.auth.signOut();
    } catch {
      // Ignore errors on logout
    }

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(SHOPPER_KEY);

    return {
      success: true,
      redirectTo: "/login",
    };
  },

  check: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      redirectTo: "/login",
    };
  },

  getPermissions: async () => null,

  getIdentity: async () => {
    const userStr = localStorage.getItem(USER_KEY);
    const shopperStr = localStorage.getItem(SHOPPER_KEY);

    if (userStr) {
      try {
        const user: StoredUser = JSON.parse(userStr);
        const shopper: StoredShopper | null = shopperStr ? JSON.parse(shopperStr) : null;

        return {
          id: user.id,
          name: shopper ? `${shopper.firstName} ${shopper.lastName}` : user.name,
          email: user.email,
          avatar: user.image,
          shopperStatus: shopper?.kycStatus,
        };
      } catch {
        return null;
      }
    }
    return null;
  },

  onError: async (error) => {
    const status = error?.statusCode || error?.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(SHOPPER_KEY);
      return {
        logout: true,
        redirectTo: "/login",
      };
    }
    return { error };
  },
};
