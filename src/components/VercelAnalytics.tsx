import { useEffect } from "react";
import { useLocation } from "react-router";
import { Analytics } from "@vercel/analytics/react";

export function VercelAnalytics() {
  const location = useLocation();
  const rawPath = location.pathname;

  // 1. Cleanly parse out variable ID fields by splitting the path array
  const pathSegments = rawPath.split("/").filter(Boolean);

  let routeTemplate = rawPath;

  // 2. Automatically catch patterns like /resource/action/id (e.g. /enrollments/create/21225)
  if (pathSegments.length >= 3) {
    const [resource, action, idOrSlug] = pathSegments;

    // Check if the 3rd item is a numeric database identifier or a token string
    const isParam = !isNaN(Number(idOrSlug)) || idOrSlug.length > 10 || idOrSlug.includes("-");

    if (isParam) {
      // 🎯 THE EXPANDED SEGMENT BLOCK:
      // If the verb is "create", explicitly name the token :classId so it stays separated from standard views
      if (action === "create") {
        routeTemplate = `/${resource}/create/:classId`;
      } else {
        // Fallback for /classes/show/:id, /departments/edit/:id, etc.
        routeTemplate = `/${resource}/${action}/:id`;
      }
    }
  }
  // 3. Catch direct list parameters / layouts (e.g. /departments)
  else if (pathSegments.length === 1) {
    routeTemplate = `/${pathSegments[0]}`;
  }

  // 🔍 FORCE CONSOLE LOGS VISIBILITY FOR LOCAL TESTING
  useEffect(() => {
    console.warn("🎯 [VERCEL ANALYTICS MONITOR] ROUTE RE-CALCULATION:", {
      "PAGES (Raw URL)": rawPath,
      "ROUTES (Clean Group)": routeTemplate
    });
  }, [rawPath, routeTemplate]);

  return (
      <Analytics
          key={rawPath} // Re-bind layout instances cleanly on every page hop
          path={rawPath}
          route={routeTemplate}
      />
  );
}
