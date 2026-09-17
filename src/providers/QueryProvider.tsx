"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
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