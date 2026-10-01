import { AuditLogProvider } from "@refinedev/core";
import { track } from "@vercel/analytics";

//Used to capture analytic 'events', such as background requests that aren't recorded by browser location analytics
//(Script complicated by the enrollment/create path arrangement)
export const vercelAnalyticsAuditProvider: AuditLogProvider = {
    create: async ({ resource, action, meta, data }) => {
        try {
            if (meta?.status && meta.status !== "success") {
                return;
            }

            const eventName = `DB Action: ${resource} [${action.toUpperCase()}]`;

            // Use actual row ID from the database response
            let recordId = data?.id || meta?.id;

            // Or, look inside Refine's mutation form variables
            if (!recordId && action === "create") {
                const vars = (meta as any)?.variables || {};
                recordId = vars.classId || vars.id;
            }

            // Or, extract the ID directly from the active URL path (e.g. /enrollments/create/123)
            if (!recordId) {
                const pathSegments = window.location.pathname.split("/").filter(Boolean);
                const lastSegment = pathSegments[pathSegments.length - 1];

                // If the very last part of the URL is a number, treat it as an id
                if (lastSegment && !isNaN(Number(lastSegment))) {
                    recordId = lastSegment;
                } else {
                    recordId = "Success";
                }
            }

            track(eventName, {
                resource: resource,
                action: action,
                record_id: String(recordId),
            });

        } catch (error) {
            console.error("Failed to ship telemetry to Vercel", error);
        }
    },

    get: async () => [],
    update: async () => ({}) as any,
};
