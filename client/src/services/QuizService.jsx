import axios from './axios';

const QuizService = {
  // ──────────── ADMIN: TOPICS ────────────
  getTopics: async () => {
    const response = await axios.get('/admin/topics');
    return response.data;
  },

  createTopic: async (data) => {
    const response = await axios.post('/admin/topics', data);
    return response.data;
  },

  deleteTopic: async (topicId) => {
    const response = await axios.delete(`/admin/topics/${topicId}`);
    return response.data;
  },

  // ──────────── ADMIN: QUESTIONS (SUBTOPICS) ────────────
  getQuestions: async (topicId = null) => {
    const response = await axios.get('/admin/questions', {
      params: topicId ? { topic_id: topicId } : {},
    });
    return response.data;
  },

  createQuestion: async (data) => {
    const response = await axios.post('/admin/questions', data);
    return response.data;
  },

  updateQuestion: async (questionId, data) => {
    const response = await axios.put(`/admin/questions/${questionId}`, data);
    return response.data;
  },

  deleteQuestion: async (questionId) => {
    const response = await axios.delete(`/admin/questions/${questionId}`);
    return response.data;
  },

  // ──────────── ADMIN: RUBRICS ────────────
  getRubricsForQuestion: async (questionId) => {
    const response = await axios.get(`/admin/questions/${questionId}/rubrics`);
    return response.data;
  },

  createRubric: async (data) => {
    const response = await axios.post('/admin/rubrics', data);
    return response.data;
  },

  updateRubric: async (rubricId, data) => {
    const response = await axios.put(`/admin/rubrics/${rubricId}`, data);
    return response.data;
  },

  deleteRubric: async (rubricId) => {
    const response = await axios.delete(`/admin/rubrics/${rubricId}`);
    return response.data;
  },

  // ──────────── USER: QUIZ FLOW ────────────
  getQuizTopics: async ({ tier = null, useUserPaper = false } = {}) => {
    const params = {};
    if (tier) params.tier = tier;
    if (useUserPaper) params.use_user_paper = true;
  
    const response = await axios.get('/quiz/topics', { params });
    return response.data;
  },
  
  getQuizQuestions: async (topicId, { tier = null, useUserPaper = false } = {}) => {
    const params = { topic_id: topicId };
    if (tier) params.tier = tier;
    if (useUserPaper) params.use_user_paper = true;
  
    const response = await axios.get('/quiz/questions', { params });
    return response.data;
  },

  getQuizRubrics: async (questionId) => {
    const response = await axios.get(`/quiz/questions/${questionId}/rubrics`);
    return response.data;
  },

  submitAssessment: async (data) => {
    const response = await axios.post('/quiz/submit', data);
    return response.data;
  },
};

export default QuizService;