// src/services/FileService.js
import axios from './axios';

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

  async downloadNotes(filename) {
    const url = `/uploads/notes/${filename}`; // ✅ Construct full URL here

    const res = await axios.get(url, {
      responseType: 'blob',
    });

    const blob = res.data;
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;

    // Try to get filename from Content-Disposition, else fall back to original filename
    const contentDisposition = res.headers['content-disposition'];
    const match = contentDisposition?.match(/filename="?(.+?)"?$/);
    const finalFilename = match ? match[1] : filename;

    link.download = finalFilename;
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