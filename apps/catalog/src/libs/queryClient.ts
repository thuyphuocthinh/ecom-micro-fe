import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "@ecom/api";

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 1, // 1 minute default cache freshness
        gcTime: 1000 * 60 * 10, // 10 minutes garbage collection
        refetchOnWindowFocus: false,
        retry(failureCount, error) {
          // Never retry on 4xx client errors (400, 401, 403, 404, etc.)
          if (
            error instanceof ApiError &&
            error.status >= 400 &&
            error.status < 500
          ) {
            return false;
          }
          return failureCount < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export const queryClient = createQueryClient();
