import axios from './axios';

const PlanService = {
  // ──────────── USER ────────────

  /**
   * Generate a new plan for the current user.
   * Automatically deletes previous plans.
   */
  generatePlan: async () => {
    const response = await axios.post('/plan/generate');
    return response.data;
  },

  /**
   * Get the current user's latest weekly plan.
   */
  getCurrentPlan: async () => {
    const response = await axios.get('/plan/view');
    return response.data;
  },

  // ──────────── ADMIN ────────────

  /**
   * Generate/regenerate a plan for a specific user by ID.
   * Deletes any existing plan for that user first.
   * @param {number} userId
   */
  regeneratePlanForUser: async (userId) => {
    const response = await axios.post(`/admin/plan/generate/${userId}`);
    return response.data;
  },

  /**
   * View the latest plan for a specific user by ID.
   * @param {number} userId
   */
  getPlanForUser: async (userId) => {
    const response = await axios.get(`/admin/plan/view/${userId}`);
    return response.data;
  }
};

export default PlanService;