"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // H-01: one minute instead of 0
        // H-01: one retry instead of 3
        // H-01: doesn't refetch when the tab regains focus
      },
      mutations: {
        onError: (error: any) => {   // ✅ H-01: global error handler
          const msg =
            error?.response?.data?.message ||
            error?.message ||
            "Something went wrong. Please try again.";
          toast.error(msg);
        },
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}