import type { AuthProvider } from "@refinedev/core";
import { SignUpPayload } from "@/types";
import { authClient } from "@/lib/auth-client";
import { z } from "zod";

let lastServerCheckAt = 0;
const CACHE_MS = 30_000; // 30-second validation window for checking server session state

const UserProfileSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  image: z.string().refine((val) => {
    // Empty image fields are valid (e.g., users without custom avatars)
    if (!val) return true;

    try {
      // Force HTTPS check natively during string resolution
      const secureUrl = val.startsWith("http://") ? val.replace("http://", "https://") : val;
      const parsedUrl = new URL(secureUrl);
      const hostname = parsedUrl.hostname;
      //Ensure the hostname itself is cloudinary
      const isCloudinary = hostname === "cloudinary.com" || hostname.endsWith(".cloudinary.com");

      // Returns true if safe, false triggers an instant structural rejection
      return hostname === "cloudinary.com" || hostname.endsWith(".cloudinary.com");
    } catch (e) {
      return false;
    }
  }),
  role: z.string().min(1),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

const localSessionCookieName = "localSessionHint=";

const parseSessionCookieHint = (): UserProfile | null => {
  if (typeof document === "undefined") return null;

  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(";");

  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i].trim();
    if (cookie.indexOf(localSessionCookieName) === 0) {
      try {
        const rawJson = cookie.substring(localSessionCookieName.length);
        const parsedRaw = JSON.parse(rawJson);
        const result = UserProfileSchema.safeParse(parsedRaw);

        if (result.success) {
          return result.data;
        }

        // fail open to unauthenticated state if the session object shape is compromised
        return null;
      } catch (error) {
        return null;
      }
    }
  }
  return null;
};

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
    // Clear the local state mirror cookie first
    if (typeof document !== "undefined") {
      document.cookie = localSessionCookieName + "; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure";
    }

    const { error } = await authClient.signOut();

    if (error) {
      console.error("Logout error:", error);
    }

    // Hard-force a browser reload to wipe out memory context
    window.location.href = "/login";
    return { success: true };
  },

  onError: async (error: any) => {
    // Read the clean .statusCode property thrown by your data provider helper
    const status = error?.statusCode;

    if (status === 401) {
      if (typeof document !== "undefined") {
        document.cookie = localSessionCookieName + "; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure";
      }
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
    const session = parseSessionCookieHint();

    if (!session) {
      return {
        authenticated: false,
        redirectTo: "/login",
        error: {name: "Unauthorized", message: "Please log in to access this page."},
      };
    }

    // Determine if we need to verify state with the backend server
    const now = Date.now();
    const shouldVerifyWithServer = now - lastServerCheckAt > CACHE_MS;

    if (shouldVerifyWithServer) {
      // Update the cache timestamp immediately to debounce rapid sequential layout triggers
      lastServerCheckAt = now;
      // Run the live server session check fully asynchronously in the background
      authClient.getSession().then(({data, error}) => {
        if (error || !data?.user) {
          console.warn("Background authentication check failed. Invalidating local session.");

          // Evict local cookie
          if (typeof document !== "undefined") {
            document.cookie = `${localSessionCookieName}; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure`;
          }

          // Force a top-level window redirect to smoothly evict the user out of the dashboard
          window.location.href = "/login";
        }
      }).catch(() => {
        // If a genuine network dropping error or slow server response e.g. server wake-up occurs
        // reset the cache timer to allow a retry on the next route change,
        // but do NOT log the user out falsely.
        lastServerCheckAt = 0;
      });
    }

    return {
      authenticated: true,
      data: session,
    };
  },
  getPermissions: async () => {
    const session = parseSessionCookieHint();
    return session ? session.role : null;
  },
  getIdentity: async () => {
    const session = parseSessionCookieHint();
    if (!session) return null;
    return {
      name: session.name,
      email: session.email,
      image: session.image,
      role: session.role
    };
  },
}
