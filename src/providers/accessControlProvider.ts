import { AccessControlProvider } from "@refinedev/core";
import { User, UserRole } from "@/types";

export const accessControlProvider: AccessControlProvider = {
    can: async ({ resource, action, params }) => {

        if (resource === "student-panel" && action === "view") {
            const user = params?.user as User | undefined;
            // Only permit explicit profiles
            if (user && (user.role === UserRole.ADMIN || user.role === UserRole.TEACHER)) {
                return { can: true };
            }
            // Any other profile type blocked
            return { can: false, reason: "Unauthorized" };
        }
        // Default for all other standard application routes
        return { can: true };
    },
};