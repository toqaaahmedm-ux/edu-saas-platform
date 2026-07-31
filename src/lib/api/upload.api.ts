import { apiClient } from './client';


export interface UploadVideoResponse {
  url: string;
  hlsUrl: string;
  publicId: string;
}

export const uploadApi = {
  uploadCourseImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post<{ success: boolean; data: { url: string } }>(
      '/upload/course-image',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );

    return response.data.data.url;
  },

  uploadCourseVideo: async (file: File): Promise<UploadVideoResponse> => {
    const formData = new FormData();
    formData.append('video', file);
    const response = await apiClient.post<{ success: boolean; data: UploadVideoResponse }>(
      '/upload/course-video',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data.data;
  },
  uploadDocument: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('document', file);
    const response = await apiClient.post<{ success: boolean; data: { url: string } } | { url: string }>(
      '/upload/document',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    const data = response.data as any;
    return data?.url ?? data?.data?.url;
  },
};