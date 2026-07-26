import { apiClient } from './client';

// FIX #25: Ø§Ù„Ù€ response Ø§Ù„ÙƒØ§Ù…Ù„ Ù…Ù† Ø§Ù„Ø¨Ø§Ùƒ Ø¥Ù†Ø¯
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

  // FIX #25: Ø¨Ù†Ø±Ø¬Ø¹ Ø§Ù„Ù€ object ÙƒØ§Ù…Ù„ Ù…Ø´ url Ø¨Ø³ â€” HLS streaming ÙˆØ­Ø°Ù Ø§Ù„ÙÙŠØ¯ÙŠÙˆ Ø´ØºØ§Ù„ÙŠÙ†
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