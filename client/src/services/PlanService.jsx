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

  /**
   * Marks a specific weekly plan entry as complete for the user.
   * @param {number} entryId - The ID of the WeeklyPlanEntry to mark complete.
   */
  markEntryComplete: async (entryId) => {
    const response = await axios.post(`/plan/entry/${entryId}/complete`);
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
  },

  /**
   * Delete the weekly plan for a specific user by ID.
   * @param {number} userId
   */
  deletePlanForUser: async (userId) => {
    const response = await axios.delete(`/admin/plan/delete/${userId}`);
    return response.data;
  }
};

export default PlanService;