import { RouterProvider } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/libs/queryClient.ts";
import { AuthProvider } from "@/features/auth";
import { router } from "@/router.tsx";

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
