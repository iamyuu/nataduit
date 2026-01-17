import { routeTree } from "@/generated/route";
import { createRouter } from "@tanstack/react-router";

export const getRouter = () => {
  const router = createRouter({
    routeTree,
    // Ensure that the loader is always called when the route is preloaded or visited
    defaultPreloadStaleTime: 0,
    // Preload the linked route on hover
    defaultPreload: "intent",
    // Enable scroll restoration
    scrollRestoration: true,

    // Fallback components for error, pending, and not found states
    // defaultErrorComponent: ErrorFallback,
    // defaultPendingComponent: PendingFallback,
    // defaultNotFoundComponent: NotFoundFallback,
  });

  return router;
};
