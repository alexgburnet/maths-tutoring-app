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
    const res = await axios.get(`/uploads/notes/${filename}`, {
      responseType: 'blob',
    });

    return res.data;
  }
}

export default new FileService();