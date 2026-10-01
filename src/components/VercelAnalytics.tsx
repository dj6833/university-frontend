import { useLocation } from "react-router";
import { Analytics } from "@vercel/analytics/react";

export function VercelAnalytics() {
  const location = useLocation();
  const rawPath = location.pathname;

  // Cleanly parse out variable ID fields by splitting the path array
  const pathSegments = rawPath.split("/").filter(Boolean);

  let routeTemplate = rawPath;

  // Automatically catch patterns like /resource/action/id
  if (pathSegments.length >= 3) {
    const [resource, action, idOrSlug] = pathSegments;

    // Check if the 3rd item is a numeric database identifier or a token string
    const isParam = !isNaN(Number(idOrSlug)) || idOrSlug.length > 10 || idOrSlug.includes("-");

    if (isParam) {
      // If the verb is "create", explicitly name the token :classId so it stays separated from standard views
      if (action === "create") {
        routeTemplate = `/${resource}/create/:classId`;
      } else {
        // Fallback for /classes/show/:id, /departments/edit/:id, etc.
        routeTemplate = `/${resource}/${action}/:id`;
      }
    }
  }
  // Catch direct list parameters / layouts (e.g. /departments)
  else if (pathSegments.length === 1) {
    routeTemplate = `/${pathSegments[0]}`;
  }

  return (
      <Analytics
          key={rawPath} // Forces Vercel to fire telemetry instantly on every page hop
          path={rawPath}
          route={routeTemplate}
      />
  );
}
