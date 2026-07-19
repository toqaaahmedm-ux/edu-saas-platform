import { apiClient } from './client';

// simple REST CRUD for all 4 academic-structure entities. There's no
// backend controller code for these yet in this codebase (the report
// covers the schema, not the endpoints) — these calls assume standard
// NestJS CRUD routes at /academic-years, /semesters, /grade-levels,
// /class-sections. Update the paths here if your actual controllers
// use different ones.
function crudApi(resource: string) {
  return {
    getAll: () => apiClient.get<{ success: boolean; data: any[] }>(`/${resource}`),
    create: (data: any) => apiClient.post(`/${resource}`, data),
    update: (id: string, data: any) => apiClient.patch(`/${resource}/${id}`, data),
    delete: (id: string) => apiClient.delete(`/${resource}/${id}`),
  };
}

export const academicYearsApi = crudApi('academic-years');
export const semestersApi = crudApi('semesters');
export const gradeLevelsApi = crudApi('grade-levels');
export const classSectionsApi = crudApi('class-sections');