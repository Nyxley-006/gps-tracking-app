import api from './api';

// ════════════════════════════════════════
//  AUTH SERVICE
// ════════════════════════════════════════
const authService = {

  // Login
  login: async (username, password) => {
    try {
      const response = await api.get('/users');
      const users    = response.data;

      const user = users.find(
        (u) =>
          u.username === username &&
          u.password === password
      );

      if (!user) {
        throw new Error('Identifiants incorrects');
      }

      const userData = {
        id:       user.id,
        username: user.username,
        email:    user.email,
        role:     user.role
      };

      localStorage.setItem('user', JSON.stringify(userData));
      return userData;

    } catch (error) {
      if (error.message === 'Identifiants incorrects') {
        throw error;
      }
      throw new Error('Serveur inaccessible - Lance: npm run server');
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if logged in
  isAuthenticated: () => {
    return !!localStorage.getItem('user');
  },

  // Check if admin
  isAdmin: () => {
    const user = localStorage.getItem('user');
    if (!user) return false;
    return JSON.parse(user).role === 'admin';
  }
};

export default authService;