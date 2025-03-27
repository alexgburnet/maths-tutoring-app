// src/services/FileService.js
import axios from './axios';
import { getAccessToken } from './auth';

class FileService {
  async uploadNotes(bookingId, file) {
    const formData = new FormData();
    formData.append('notes', file);

    const res = await axios.post(`/admin/upload-notes/${bookingId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return res.data;
  }

  async downloadNotes(fileUrl) {
    const token = getAccessToken();

    const response = await fetch(fileUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to download file");
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;

    const contentDisposition = response.headers.get("Content-Disposition");
    const match = contentDisposition?.match(/filename="?(.+?)"?/);
    const filename = match ? match[1] : "download.pdf";

    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  async deleteNotes(bookingId) {
    const res = await axios.delete(`/admin/delete-notes/${bookingId}`);
    return res.data;
  }
}

export default new FileService();