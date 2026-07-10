import api from './api';

const authService = {

  // ── LOGIN ──
  login: async (username, password) => {
    try {
      const response = await api.get('/users');
      const users = response.data;

      const user = users.find(
        (u) => u.username === username && u.password === password
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

  // ── REGISTER ──
  register: async ({ username, password, email }) => {
    try {
      const response = await api.get('/users');
      const users = response.data;

      const existingUser = users.find(u => u.username === username);
      if (existingUser) {
        throw new Error('Ce nom d\'utilisateur existe déjà');
      }

      const existingEmail = users.find(u => u.email === email);
      if (existingEmail) {
        throw new Error('Cet email est déjà utilisé');
      }

      const newUser = {
        username,
        password,
        email,
        role: 'user',
        avatar: '',
        createdAt: new Date().toISOString()
      };

      const createResponse = await api.post('/users', newUser);
      const createdUser = createResponse.data;

      const userData = {
        id:       createdUser.id,
        username: createdUser.username,
        email:    createdUser.email,
        role:     createdUser.role
      };

      localStorage.setItem('user', JSON.stringify(userData));
      return userData;

    } catch (error) {
      if (error.message.includes('existe déjà') || error.message.includes('déjà utilisé')) {
        throw error;
      }
      throw new Error('Erreur lors de l\'inscription');
    }
  },

  // ── LOGOUT ──
  logout: () => {
    localStorage.removeItem('user');
  },

  // ── GET CURRENT USER ──
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // ── IS AUTHENTICATED ──
  isAuthenticated: () => {
    return !!localStorage.getItem('user');
  },

  // ── IS ADMIN ──
  isAdmin: () => {
    const user = localStorage.getItem('user');
    if (!user) return false;
    return JSON.parse(user).role === 'admin';
  }
};

export default authService;