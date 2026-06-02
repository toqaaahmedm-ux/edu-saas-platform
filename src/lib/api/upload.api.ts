import { apiClient } from './client';

export const uploadApi = {
  uploadCourseImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post<{ success: boolean; data: { url: string } }>(
      '/upload/course-image',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );

    return response.data.data.url;
  },

  uploadCourseVideo: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('video', file);

    const response = await apiClient.post<{ success: boolean; data: { url: string } }>(
      '/upload/course-video',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );

    return response.data.data.url;
  },
};