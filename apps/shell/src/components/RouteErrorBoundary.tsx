import { useRouteError } from "react-router";
import { ErrorFallback } from "@ecom/ui";

export function RouteErrorBoundary() {
  const error = useRouteError();
  return <ErrorFallback error={error} />;
}
