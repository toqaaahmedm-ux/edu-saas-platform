import { apiClient } from './client';

// FIX #25: الـ response الكامل من الباك إند
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

  // FIX #25: بنرجع الـ object كامل مش url بس — HLS streaming وحذف الفيديو شغالين
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
};