import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../store/slices/authSlice';

// ════════════════════════════════════════
//  LOGIN PAGE - Hacker Style
// ════════════════════════════════════════
const LoginPage = () => {

  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(form));
  };

  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  return (
    <div style={styles.container}>

      {/* Background Matrix effect */}
      <div style={styles.overlay}></div>

      <div style={styles.card} className="neon-border-green">

        <h1 style={styles.title} className="neon-text-green glitch-text" data-text="GPS HACKER SYSTEM">
          GPS HACKER SYSTEM
        </h1>

        <p style={styles.subtitle}>
          Secure Access Terminal
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>

          <input
            type="text"
            name="username"
            placeholder="Username"
            className="input"
            value={form.username}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="input"
            value={form.password}
            onChange={handleChange}
            required
          />

          {error && (
            <div style={styles.error}>
              ⚠ {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '10px' }}
          >
            {loading ? 'CONNECTING...' : 'ACCESS SYSTEM'}
          </button>

        </form>

        <div style={styles.footer}>
          <span>Demo: admin / admin123</span>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;

// ════════════════════════════════════════
//  STYLES
// ════════════════════════════════════════
const styles = {

  container: {
    height: '100vh',
    width: '100vw',
    background: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden'
  },

  overlay: {
    position: 'absolute',
    inset: 0,
    background:
      'radial-gradient(circle at center, rgba(0,255,65,0.05), transparent 70%)',
    animation: 'pulse 4s infinite'
  },

  card: {
    width: '350px',
    padding: '40px 30px',
    background: '#0a0a0a',
    borderRadius: '8px',
    textAlign: 'center',
    position: 'relative',
    zIndex: 2
  },

  title: {
    fontSize: '20px',
    marginBottom: '8px',
    letterSpacing: '3px'
  },

  subtitle: {
    fontSize: '11px',
    color: '#666',
    marginBottom: '30px',
    letterSpacing: '2px'
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },

  error: {
    fontSize: '11px',
    color: '#ff003c',
    marginTop: '5px'
  },

  footer: {
    marginTop: '20px',
    fontSize: '10px',
    color: '#444'
  }

};