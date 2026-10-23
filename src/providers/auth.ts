import type { AuthProvider } from "@refinedev/core";
import { User, SignUpPayload } from "@/types";
import { authClient } from "@/lib/auth-client";

let cached: { user: User | null; at: number } | null = null;
const CACHE_MS = 30_000;

async function getSessionUser(): Promise<User | null> {
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.user;
  const { data } = await authClient.getSession();
  const user = (data?.user as unknown as User | undefined) ?? null;
  cached = { user, at: Date.now() };
  return user;
}


export const authProvider: AuthProvider = {
  register: async ({
    email,
    password,
    name,
    image,
    imageCldPubId,
  }: SignUpPayload) => {
    try {
      const { data, error } = await authClient.signUp.email({
        name,
        email,
        password,
        image,
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

      // Set cached user record
      cached = { user: data.user as unknown as User, at: Date.now() };

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

      // Set cached user record
      cached = { user: data.user as unknown as User, at: Date.now() };

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

    // Clear cached user record
    cached = null;

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
      // Clear cached user record
      cached = null;
      // The page redirect causes the "unauthorised" toast to be lost before user can see it; using sessionStorage to flag this to the login screen
      sessionStorage.setItem("auth_notice", "Your session has expired. Please sign in again.");
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
    const user = await getSessionUser();
    if (user) return { authenticated: true, data: user };
    return {
      authenticated: false,
      redirectTo: "/login",
      error: { name: "Unauthorized", message: "Please log in to access this page." },
    };
  },
  getPermissions: async () => {
    const user = await getSessionUser();
    return user ? { role: user.role } : null;
  },
  getIdentity: async () => {
    const user = await getSessionUser();
    if (!user) return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      imageCldPubId: user.imageCldPubId,
    };
  },

};
