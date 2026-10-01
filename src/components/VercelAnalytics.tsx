import { useLocation } from "react-router";
import { useResourceParams } from "@refinedev/core";
import { Analytics } from "@vercel/analytics/react";

export function VercelAnalytics() {
  const location = useLocation();
  const rawPath = location.pathname;

  const { resource, action } = useResourceParams();

  let routeTemplate = rawPath;

  if (resource && action) {
    // Look up the exact layout string (e.g. resource['show'] or resource['list'])
    const matchedPath = resource[action as keyof typeof resource];

    if (typeof matchedPath === "string") {
      routeTemplate = matchedPath;
    } else if (resource.meta && typeof resource.meta === "object") {
      // Fallback check for custom action routes nested in metadata configurations
      const customRoutes = (resource.meta as any).routes || {};
      if (typeof customRoutes[action] === "string") {
        routeTemplate = customRoutes[action];
      }
    }
  }

  return (
      <Analytics
          key={rawPath} // Forces Vercel to fire telemetry instantly on every page hop
          path={rawPath}
          route={routeTemplate}
      />
  );
}
