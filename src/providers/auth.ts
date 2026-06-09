import type { AuthProvider } from "@refinedev/core";
import { User, SignUpPayload } from "@/types";
import { authClient } from "@/lib/auth-client";

export const authProvider: AuthProvider = {
  register: async ({
    email,
    password,
    name,
    role,
    image,
    imageCldPubId,
  }: SignUpPayload) => {
    try {
      const { data, error } = await authClient.signUp.email({
        name,
        email,
        password,
        image,
        role,
        imageCldPubId,
      } as SignUpPayload);

      if (error) {
        return {
          success: false,
          error: {
            name: "Registration failed",
            message:
              error?.message || "Unable to create account. Please try again.",
          },
        };
      }

      // Store user data
      localStorage.setItem("user", JSON.stringify(data.user));

      return {
        success: true,
        redirectTo: "/",
      };
    } catch (error) {
      console.error("Register error:", error);
      return {
        success: false,
        error: {
          name: "Registration failed",
          message: "Unable to create account. Please try again.",
        },
      };
    }
  },
  login: async ({ email, password }) => {
    try {
      const { data, error } = await authClient.signIn.email({
        email: email,
        password: password,
      });

      if (error) {
        console.error("Login error from auth client:", error);
        return {
          success: false,
          error: {
            name: "Login failed",
            message: error?.message || "Please try again later.",
          },
        };
      }

      // Store user data
      localStorage.setItem("user", JSON.stringify(data.user));

      return {
        success: true,
        redirectTo: "/",
      };
    } catch (error) {
      console.error("Login exception:", error);
      return {
        success: false,
        error: {
          name: "Login failed",
          message: "Please try again later.",
        },
      };
    }
  },
  logout: async () => {
    const { error } = await authClient.signOut();

    if (error) {
      console.error("Logout error:", error);
      return {
        success: false,
        error: {
          name: "Logout failed",
          message: "Unable to log out. Please try again.",
        },
      };
    }

    localStorage.removeItem("user");

    // Hard-force a browser reload to the login page.
    // This physically destroys the React memory heap and flushes out TanStack Query completely, ensuring no cached data leak possible for subsequent logins
    window.location.href = "/login";

    // Return success, but omit the 'redirectTo' property so Refine's router provider doesn't try to perform a duplicate SPA transition.
    return {
      success: true,
    };
  },
  onError: async (error: any) => {
    // Read the clean .statusCode property thrown by your data provider helper
    const status = error?.statusCode;

    if (status === 401) {
      localStorage.removeItem("user");
      // Modern Refine requires returning an OnErrorResponse object
      // This triggers a clean Single Page Application redirect and logs them out
      return {
        logout: true,
        redirectTo: "/login",
      };
    }
    // For 403 Forbidden or other application errors, return an empty object.
    // This tells Refine NOT to log them out, allowing the toast notification to do its job.
    return {};
  },
  check: async () => {
    const userString = localStorage.getItem("user");

    if (userString) {
      try {
        const user = JSON.parse(userString);
        return {
          authenticated: true,
          // Optional: Exposing the user profile lets you access things
          // like user.role across your UI
          data: user,
        };
      } catch (e) {
        // If the localStorage string is corrupted, treat it as unauthenticated
        localStorage.removeItem("user");
      }
    }
    // If no user exists, return authenticated: false.
    // Refine's routing system handles the redirect to /login automatically.
    return {
      authenticated: false,
      redirectTo: "/login",
      error: {
        name: "Unauthorized",
        message: "Please log in to access this page.",
      },
    };
  },
  getPermissions: async () => {
    const user = localStorage.getItem("user");

    if (!user) return null;
    const parsedUser: User = JSON.parse(user);

    return {
      role: parsedUser.role,
    };
  },
  getIdentity: async () => {
    const user = localStorage.getItem("user");

    if (!user) return null;
    const parsedUser: User = JSON.parse(user);

    return {
      id: parsedUser.id,
      name: parsedUser.name,
      email: parsedUser.email,
      image: parsedUser.image,
      role: parsedUser.role,
      imageCldPubId: parsedUser.imageCldPubId,
    };
  },
};
