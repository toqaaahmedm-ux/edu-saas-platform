import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  academicYearsApi,
  semestersApi,
  gradeLevelsApi,
  classSectionsApi,
} from "@/lib/api/academic.api";

// one factory instead of copy-pasting the same 4 hooks per entity —
// all 4 academic-structure resources follow the exact same CRUD shape
function useCrudResource(key: string, api: { getAll: () => Promise<any>; create: (d: any) => Promise<any>; update: (id: string, d: any) => Promise<any>; delete: (id: string) => Promise<any> }) {
  const queryKey = [key] as const;

  const useList = () =>
    useQuery({
      queryKey,
      queryFn: async () => {
        const res = await api.getAll();
        return (res.data as any)?.data || [];
      },
      staleTime: 0,
    });

  const useCreate = () => {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (data: any) => api.create(data),
      onSuccess: () => qc.invalidateQueries({ queryKey }),
    });
  };

  const useUpdate = () => {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: any }) => api.update(id, data),
      onSuccess: () => qc.invalidateQueries({ queryKey }),
    });
  };

  const useRemove = () => {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (id: string) => api.delete(id),
      onSuccess: () => qc.invalidateQueries({ queryKey }),
    });
  };

  return { useList, useCreate, useUpdate, useRemove };
}

export const academicYears = useCrudResource("academic-years", academicYearsApi);
export const semesters = useCrudResource("semesters", semestersApi);
export const gradeLevels = useCrudResource("grade-levels", gradeLevelsApi);
export const classSections = useCrudResource("class-sections", classSectionsApi);