import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { useAuthStore } from "@/store/useAuthStore";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

// ── عدد الإشعارات غير المقروءة ──
export const useUnreadCount = () => {
  const user = useAuthStore((state) => state.user);

  return useQuery<number>({
    queryKey: ["notifications-unread"],
    queryFn: async () => {
      const res = await apiClient.get("/notifications/unread-count");
      return res.data?.data ?? res.data ?? 0;
    },
    enabled: !!user,
    refetchInterval: 30000,
  });
};

// ── جلب كل الإشعارات ──
export const useNotifications = () => {
  const user = useAuthStore((state) => state.user);

  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await apiClient.get("/notifications");
      return res.data?.data ?? res.data ?? [];
    },
    enabled: !!user,
    refetchInterval: 30000,
  });
};

// ── تحديد إشعار كمقروء ──
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.patch(`/notifications/${id}/read`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
  });
};

// ── تحديد كل الإشعارات كمقروءة ──
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await apiClient.patch("/notifications/mark-all-read");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
  });
};