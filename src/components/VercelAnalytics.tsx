import { useLocation } from "react-router";
import { useResourceParams } from "@refinedev/core";
import { Analytics } from "@vercel/analytics/react";

export function VercelAnalytics() {
  const location = useLocation();
  const rawPath = location.pathname;
  const { resource, action, id } = useResourceParams();

  let routeTemplate = rawPath;

  if (resource && action) {
    // Look up meta.route if available, otherwise default to the resource name string
    const resourcePath = (resource.meta as any)?.route || resource.name;

    if (action === "list") {
      routeTemplate = `/${resourcePath}`;
    } else if (id) {
      // Cleanly translates variable details like "/classes/show/21119" to "/classes/show/:id"
      routeTemplate = `/${resourcePath}/${action}/:id`;
    } else {
      routeTemplate = `/${resourcePath}/${action}`;
    }
  }

  return (
      <Analytics
          path={rawPath}
          route={routeTemplate}
      />
  );
}
