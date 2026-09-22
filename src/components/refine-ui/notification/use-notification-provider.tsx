import { UndoableNotification } from "@/components/refine-ui/notification/undoable-notification";
import type { NotificationProvider } from "@refinedev/core";
import { toast } from "sonner";

// 💡 Helper function to strip out raw JSON text blocks and extract the actual message
const cleanToastText = (text: string | undefined): string | undefined => {
  if (!text || typeof text !== "string") return text;

  // Check if Refine passed an ugly stringified JSON object
  if (text.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(text);
      // Safely extract just the inner message ("Access Denied...") or error keyword
      return parsed.message || parsed.error || text;
    } catch (e) {
      // Fallback to the original text if it's not valid JSON
      return text;
    }
  }
  return text;
};

export function useNotificationProvider(): NotificationProvider {
  return {
    open: ({
      key,
      type,
      message,
      description,
      undoableTimeout,
      cancelMutation,
    }) => {
      switch (type) {
        case "success":
          toast.success(message, {
            id: key,
            description,
            richColors: true,
          });
          return;

        case "error":
          // Clean up the raw JSON body description text as before
          const cleanDesc = cleanToastText(description);

          // Clean up the title string layout by removing the status code snippet
          let cleanTitle = message || "An error occurred";

          if (typeof cleanTitle === "string") {
            //Clear out any http status code the Refine engine includes during an error
            cleanTitle = cleanTitle.replace(/\s*\(status code:\s*\d+\)/i, "");
          }

          toast.error(cleanTitle, {
            id: key,
            description: cleanDesc,
            richColors: true,
          });
          return;

        case "progress": {
          const toastId = key || Date.now();

          toast(
            () => (
              <UndoableNotification
                message={message}
                description={description}
                undoableTimeout={undoableTimeout}
                cancelMutation={cancelMutation}
                onClose={() => toast.dismiss(toastId)}
              />
            ),
            {
              id: toastId,
              duration: (undoableTimeout || 5) * 1000,
              unstyled: true,
            }
          );
          return;
        }

        default:
          return;
      }
    },
    close: (id) => {
      toast.dismiss(id);
    },
  };
}