import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, register, clearError, clearSuccess } from '../store/slices/authSlice';

const Icons = {
  User: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Lock: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Mail: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  Eye: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  EyeOff: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ),
  Alert: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Google: () => (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  ),
  Github: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  ),
  Facebook: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877f2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  MapPin: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Zap: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Shield: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Radio: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="2" />
      <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
    </svg>
  ),
  Logo: () => (
    <svg width="52" height="52" viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00ff41" />
          <stop offset="100%" stopColor="#00b32c" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="45" stroke="url(#logoGrad)" strokeWidth="2" fill="rgba(0,255,65,0.05)" />
      <circle cx="50" cy="50" r="35" stroke="url(#logoGrad)" strokeWidth="1.5" fill="none" opacity="0.6" />
      <circle cx="50" cy="50" r="8" fill="url(#logoGrad)" />
      <line x1="50" y1="15" x2="50" y2="25" stroke="#00ff41" strokeWidth="2" strokeLinecap="round" />
      <line x1="50" y1="75" x2="50" y2="85" stroke="#00ff41" strokeWidth="2" strokeLinecap="round" />
      <line x1="15" y1="50" x2="25" y2="50" stroke="#00ff41" strokeWidth="2" strokeLinecap="round" />
      <line x1="75" y1="50" x2="85" y2="50" stroke="#00ff41" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
};

const LoginPage = () => {
  const dispatch = useDispatch();
  const { loading, error, successMessage } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    username: '',
    password: '',
    email: '',
    confirmPassword: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isRegister) {
      if (!form.email || !form.email.includes('@')) {
        alert('⚠ Email invalide');
        return;
      }
      if (form.username.length < 3) {
        alert('⚠ Le username doit contenir au moins 3 caractères');
        return;
      }
      if (form.password.length < 6) {
        alert('⚠ Le mot de passe doit contenir au moins 6 caractères');
        return;
      }
      if (form.password !== form.confirmPassword) {
        alert('⚠ Les mots de passe ne correspondent pas');
        return;
      }

      dispatch(register({
        username: form.username,
        password: form.password,
        email: form.email
      }));
    } else {
      dispatch(login({
        username: form.username,
        password: form.password
      }));
    }
  };

  const handleSocialLogin = (provider) => {
    alert(`Connexion via ${provider.toUpperCase()} - En cours de développement`);
  };

  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [dispatch]);

  useEffect(() => {
    setForm({ username: '', password: '', email: '', confirmPassword: '' });
    dispatch(clearError());
  }, [isRegister, dispatch]);

  return (
    <div style={styles.container}>

      {/* ═══════════════════════════════════════
          LEFT PANEL - PRESENTATION
      ═══════════════════════════════════════ */}
      <div style={styles.leftPanel}>

        {/* Corners décoratifs */}
        <span style={{...styles.panelCorner, top: '-1px', left: '-1px', borderWidth: '2px 0 0 2px'}}></span>
        <span style={{...styles.panelCorner, top: '-1px', right: '-1px', borderWidth: '2px 2px 0 0'}}></span>
        <span style={{...styles.panelCorner, bottom: '-1px', left: '-1px', borderWidth: '0 0 2px 2px'}}></span>
        <span style={{...styles.panelCorner, bottom: '-1px', right: '-1px', borderWidth: '0 2px 2px 0'}}></span>

        {/* Backgrounds */}
        <div style={styles.gridBg}></div>
        <div style={styles.radarPulse}></div>
        <div style={styles.glowOrb1}></div>
        <div style={styles.glowOrb2}></div>

        <div style={styles.particles}>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              style={{
                ...styles.particle,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>

        <div style={styles.coordTL}>
          <div style={styles.coordText}>LAT: -18.8792°</div>
          <div style={styles.coordText}>LNG: 47.5079°</div>
          <div style={styles.coordText}>ALT: 1276m</div>
        </div>

        <div style={styles.coordBR}>
          <div style={styles.coordText}>◉ ONLINE</div>
          <div style={styles.coordText}>SIGNAL: 98%</div>
        </div>

        <div style={styles.leftContent}>

          <div style={styles.brand}>
            <div style={styles.brandLogo}>
              <Icons.Logo />
            </div>
            <div>
              <h1 style={styles.brandTitle}>GPS HACKER</h1>
              <div style={styles.brandSubline}>
                <span style={styles.brandVersion}>SYSTEM v1.0</span>
                <span style={styles.brandDot}>•</span>
                <span style={styles.brandStatus}>ACTIVE</span>
              </div>
            </div>
          </div>

          <div style={styles.hero}>
            <div style={styles.heroTag}>
              <span style={styles.heroTagDot}></span>
              REAL-TIME GPS PLATFORM
            </div>
            <h2 style={styles.heroTitle}>
              Track<br/>
              <span style={styles.heroAccent}>Everything</span><br/>
              <span style={styles.heroSmall}>Everywhere.</span>
            </h2>
            <p style={styles.heroDesc}>
              Système professionnel de surveillance GPS.<br/>
              Gérez votre flotte, sécurisez vos actifs en temps réel.
            </p>
          </div>

          <div style={styles.features}>
            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>
                <Icons.MapPin />
              </div>
              <div style={styles.featureContent}>
                <div style={styles.featureTitle}>Real-Time Tracking</div>
                <div style={styles.featureDesc}>GPS live 24/7</div>
              </div>
            </div>

            <div style={styles.featureItem}>
              <div style={{...styles.featureIcon, borderColor: 'rgba(0,255,255,0.4)', color: '#00ffff'}}>
                <Icons.Zap />
              </div>
              <div style={styles.featureContent}>
                <div style={styles.featureTitle}>Smart Alerts</div>
                <div style={styles.featureDesc}>Notifications instantanées</div>
              </div>
            </div>

            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>
                <Icons.Shield />
              </div>
              <div style={styles.featureContent}>
                <div style={styles.featureTitle}>Secure & Encrypted</div>
                <div style={styles.featureDesc}>Chiffrement end-to-end</div>
              </div>
            </div>

            <div style={styles.featureItem}>
              <div style={{...styles.featureIcon, borderColor: 'rgba(0,255,255,0.4)', color: '#00ffff'}}>
                <Icons.Radio />
              </div>
              <div style={styles.featureContent}>
                <div style={styles.featureTitle}>Multi-Device</div>
                <div style={styles.featureDesc}>Véhicules, IoT, drones</div>
              </div>
            </div>
          </div>

          <div style={styles.statsBar}>
            <div style={styles.statItem}>
              <div style={styles.statValue}>12K+</div>
              <div style={styles.statLabel}>DEVICES</div>
            </div>
            <div style={styles.statDivider}></div>
            <div style={styles.statItem}>
              <div style={styles.statValue}>99.9%</div>
              <div style={styles.statLabel}>UPTIME</div>
            </div>
            <div style={styles.statDivider}></div>
            <div style={styles.statItem}>
              <div style={styles.statValue}>24/7</div>
              <div style={styles.statLabel}>SUPPORT</div>
            </div>
          </div>

          <div style={styles.bottomBadge}>
            <span style={styles.statusDot}></span>
            <span>SYSTEM ONLINE</span>
            <span style={styles.badgeSep}>•</span>
            <span>MADAGASCAR</span>
          </div>

        </div>
      </div>

      {/* ═══════════════════════════════════════
          RIGHT PANEL - FORM
      ═══════════════════════════════════════ */}
      <div style={styles.rightPanel}>

        {/* Corners décoratifs */}
        <span style={{...styles.panelCorner, top: '-1px', left: '-1px', borderWidth: '2px 0 0 2px'}}></span>
        <span style={{...styles.panelCorner, top: '-1px', right: '-1px', borderWidth: '2px 2px 0 0'}}></span>
        <span style={{...styles.panelCorner, bottom: '-1px', left: '-1px', borderWidth: '0 0 2px 2px'}}></span>
        <span style={{...styles.panelCorner, bottom: '-1px', right: '-1px', borderWidth: '0 2px 2px 0'}}></span>

        <div style={styles.rightGrid}></div>

        <div style={styles.formContainer}>

          <div style={styles.terminalBar}>
            <span style={{...styles.terminalDot, background: '#ff003c'}}></span>
            <span style={{...styles.terminalDot, background: '#ff6600'}}></span>
            <span style={{...styles.terminalDot, background: '#00ff41'}}></span>
            <span style={styles.terminalTitle}>auth.terminal</span>
          </div>

          <div style={styles.tabs}>
            <button
              style={{
                ...styles.tab,
                ...(!isRegister ? styles.tabActive : {})
              }}
              onClick={() => setIsRegister(false)}
            >
              SIGN IN
            </button>
            <button
              style={{
                ...styles.tab,
                ...(isRegister ? styles.tabActive : {})
              }}
              onClick={() => setIsRegister(true)}
            >
              SIGN UP
            </button>
          </div>

          <div style={styles.formHeader}>
            <div style={styles.formPrompt}>
              <span style={styles.prompt}>&gt;</span>
              <span style={styles.formTag}>
                {isRegister ? 'INITIATE_REGISTRATION' : 'INITIATE_LOGIN'}
              </span>
              <span style={styles.cursor}>_</span>
            </div>
            <h2 style={styles.formTitle}>
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p style={styles.formSubtitle}>
              {isRegister
                ? 'Créez votre compte pour accéder au système'
                : 'Connectez-vous à votre système sécurisé'}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>

            {isRegister && (
              <div style={styles.field}>
                <label style={styles.label}>
                  <Icons.Mail /> EMAIL
                </label>
                <div style={{
                  ...styles.inputWrapper,
                  borderColor: focusedField === 'email' ? '#00ff41' : 'rgba(0, 255, 65, 0.2)',
                  boxShadow: focusedField === 'email' ? '0 0 0 3px rgba(0,255,65,0.1)' : 'inset 0 0 15px rgba(0, 255, 65, 0.03)'
                }}>
                  <input
                    type="email"
                    name="email"
                    placeholder="admin@gpshacker.com"
                    value={form.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    style={styles.input}
                  />
                </div>
              </div>
            )}

            <div style={styles.field}>
              <label style={styles.label}>
                <Icons.User /> USERNAME
              </label>
              <div style={{
                ...styles.inputWrapper,
                borderColor: focusedField === 'username' ? '#00ff41' : 'rgba(0, 255, 65, 0.2)',
                boxShadow: focusedField === 'username' ? '0 0 0 3px rgba(0,255,65,0.1)' : 'inset 0 0 15px rgba(0, 255, 65, 0.03)'
              }}>
                <input
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  value={form.username}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  style={styles.input}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                <Icons.Lock /> PASSWORD
              </label>
              <div style={{
                ...styles.inputWrapper,
                borderColor: focusedField === 'password' ? '#00ff41' : 'rgba(0, 255, 65, 0.2)',
                boxShadow: focusedField === 'password' ? '0 0 0 3px rgba(0,255,65,0.1)' : 'inset 0 0 15px rgba(0, 255, 65, 0.03)'
              }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder={isRegister ? 'Min. 6 caractères' : '••••••••'}
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  style={{...styles.input, paddingRight: '44px'}}
                  required
                />
                <button
                  type="button"
                  style={styles.eyeBtn}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                </button>
              </div>
            </div>

            {isRegister && (
              <div style={styles.field}>
                <label style={styles.label}>
                  <Icons.Lock /> CONFIRM PASSWORD
                </label>
                <div style={{
                  ...styles.inputWrapper,
                  borderColor: focusedField === 'confirmPassword' ? '#00ff41' : 'rgba(0, 255, 65, 0.2)',
                  boxShadow: focusedField === 'confirmPassword' ? '0 0 0 3px rgba(0,255,65,0.1)' : 'inset 0 0 15px rgba(0, 255, 65, 0.03)'
                }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Confirm password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    style={styles.input}
                    required
                  />
                </div>
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <span style={{fontSize: '10px', color: '#ff003c', marginTop: '4px'}}>
                    ⚠ Les mots de passe ne correspondent pas
                  </span>
                )}
                {form.confirmPassword && form.password === form.confirmPassword && form.password.length > 0 && (
                  <span style={{fontSize: '10px', color: '#00ff41', marginTop: '4px'}}>
                    ✓ Mots de passe identiques
                  </span>
                )}
              </div>
            )}

            {!isRegister && (
              <div style={styles.optionsRow}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={styles.checkbox}
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  style={styles.forgotBtn}
                  onClick={() => alert('Récupération - En cours')}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {error && (
              <div style={styles.errorBox}>
                <Icons.Alert />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div style={styles.successBox}>
                <span>✓</span>
                <span>{successMessage}</span>
              </div>
            )}

            <button
              type="submit"
              style={{
                ...styles.submitBtn,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'wait' : 'pointer'
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span style={styles.spinner}>⟳</span>
                  PROCESSING...
                </>
              ) : (
                <>
                  {isRegister ? 'CREATE ACCOUNT' : 'ACCESS SYSTEM'}
                  <span style={styles.arrowIcon}>→</span>
                </>
              )}
            </button>

          </form>

          <div style={styles.divider}>
            <span style={styles.dividerLine}></span>
            <span style={styles.dividerText}>OR CONTINUE WITH</span>
            <span style={styles.dividerLine}></span>
          </div>

          <div style={styles.socialButtons}>
            <button style={styles.socialBtn} onClick={() => handleSocialLogin('google')}>
              <Icons.Google />
              <span>Google</span>
            </button>

            <button style={styles.socialBtn} onClick={() => handleSocialLogin('github')}>
              <Icons.Github />
              <span>GitHub</span>
            </button>

            <button style={styles.socialBtn} onClick={() => handleSocialLogin('facebook')}>
              <Icons.Facebook />
              <span>Facebook</span>
            </button>
          </div>

          <div style={styles.terms}>
            By continuing, you agree to our{' '}
            <span style={styles.termsLink}>Terms of Service</span>
            {' '}&{' '}
            <span style={styles.termsLink}>Privacy Policy</span>
          </div>

        </div>
      </div>

    </div>
  );
};

export default LoginPage;

const styles = {
  container: {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    gap: '20px',
    padding: '20px',
    background: '#000',
    fontFamily: 'monospace',
    overflow: 'hidden'
  },

  panelCorner: {
    position: 'absolute',
    width: '20px',
    height: '20px',
    borderColor: '#00ff41',
    borderStyle: 'solid',
    boxShadow: '0 0 12px rgba(0, 255, 65, 0.8)',
    zIndex: 20,
    borderRadius: '2px',
    pointerEvents: 'none'
  },

  leftPanel: {
    flex: '1.3',
    position: 'relative',
    background: 'radial-gradient(ellipse at top left, rgba(0, 26, 10, 0.6) 0%, rgba(0, 0, 0, 0.4) 60%)',
    display: 'flex',
    alignItems: 'center',
    padding: '60px 70px',
    overflow: 'hidden',
    border: '1px solid rgba(0, 255, 65, 0.25)',
    borderRadius: '12px',
    boxShadow: '0 0 0 1px rgba(0, 255, 65, 0.1), 0 0 30px rgba(0, 255, 65, 0.15), 0 0 60px rgba(0, 255, 65, 0.08), inset 0 0 40px rgba(0, 255, 65, 0.03), inset 0 1px 0 rgba(0, 255, 65, 0.2)',
    backdropFilter: 'blur(10px)'
  },

  gridBg: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'linear-gradient(rgba(0,255,65,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.05) 1px, transparent 1px)',
    backgroundSize: '50px 50px',
    pointerEvents: 'none',
    maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 90%)',
    WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 90%)'
  },

  radarPulse: {
    position: 'absolute',
    top: '50%',
    left: '30%',
    transform: 'translate(-50%, -50%)',
    width: '600px',
    height: '600px',
    border: '1px solid rgba(0, 255, 65, 0.15)',
    borderRadius: '50%',
    animation: 'radarPulse 4s ease-out infinite',
    pointerEvents: 'none'
  },

  glowOrb1: {
    position: 'absolute',
    top: '15%',
    left: '5%',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(0,255,65,0.12) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(60px)',
    pointerEvents: 'none'
  },

  glowOrb2: {
    position: 'absolute',
    bottom: '10%',
    right: '10%',
    width: '350px',
    height: '350px',
    background: 'radial-gradient(circle, rgba(0,255,255,0.1) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(60px)',
    pointerEvents: 'none'
  },

  particles: { position: 'absolute', inset: 0, pointerEvents: 'none' },

  particle: {
    position: 'absolute',
    width: '2px',
    height: '2px',
    background: '#00ff41',
    borderRadius: '50%',
    boxShadow: '0 0 6px #00ff41',
    animation: 'blink 3s infinite'
  },

  coordTL: {
    position: 'absolute',
    top: '30px',
    left: '30px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    zIndex: 5
  },

  coordBR: {
    position: 'absolute',
    bottom: '30px',
    right: '30px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    alignItems: 'flex-end',
    zIndex: 5
  },

  coordText: {
    fontSize: '9px',
    color: '#00ff41',
    letterSpacing: '2px',
    opacity: 0.4,
    fontFamily: 'monospace'
  },

  leftContent: {
    position: 'relative',
    zIndex: 2,
    maxWidth: '520px',
    color: '#e0e0e0'
  },

  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    marginBottom: '50px'
  },

  brandLogo: {
    width: '64px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    filter: 'drop-shadow(0 0 15px rgba(0, 255, 65, 0.6))'
  },

  brandTitle: {
    fontSize: '22px',
    color: '#00ff41',
    letterSpacing: '4px',
    margin: '0 0 4px',
    fontWeight: 700,
    textShadow: '0 0 15px rgba(0, 255, 65, 0.6)'
  },

  brandSubline: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  brandVersion: {
    fontSize: '10px',
    color: '#666',
    letterSpacing: '3px',
    fontWeight: 600
  },

  brandDot: { color: '#333', fontSize: '10px' },

  brandStatus: {
    fontSize: '10px',
    color: '#00ff41',
    letterSpacing: '2px',
    fontWeight: 600
  },

  hero: { marginBottom: '45px' },

  heroTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    background: 'rgba(0, 255, 65, 0.08)',
    border: '1px solid rgba(0, 255, 65, 0.3)',
    borderRadius: '20px',
    fontSize: '9px',
    color: '#00ff41',
    letterSpacing: '2px',
    fontWeight: 700,
    marginBottom: '24px'
  },

  heroTagDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#00ff41',
    boxShadow: '0 0 6px #00ff41',
    animation: 'blink 1.5s infinite'
  },

  heroTitle: {
    fontSize: '52px',
    fontWeight: 900,
    color: '#e0e0e0',
    lineHeight: 1.05,
    margin: '0 0 20px',
    letterSpacing: '1px'
  },

  heroAccent: {
    color: '#00ff41',
    textShadow: '0 0 25px rgba(0, 255, 65, 0.8)',
    display: 'inline-block'
  },

  heroSmall: {
    fontSize: '32px',
    color: '#666',
    fontWeight: 400
  },

  heroDesc: {
    fontSize: '13px',
    color: '#888',
    lineHeight: 1.8,
    letterSpacing: '0.5px',
    margin: 0
  },

  features: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '35px'
  },

  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: 'rgba(0, 255, 65, 0.02)',
    border: '1px solid rgba(0, 255, 65, 0.1)',
    borderRadius: '6px',
    transition: 'all 0.3s ease'
  },

  featureIcon: {
    width: '38px',
    height: '38px',
    borderRadius: '6px',
    background: 'rgba(0, 255, 65, 0.08)',
    border: '1px solid rgba(0, 255, 65, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#00ff41',
    flexShrink: 0
  },

  featureContent: { minWidth: 0 },

  featureTitle: {
    fontSize: '12px',
    color: '#e0e0e0',
    fontWeight: 700,
    letterSpacing: '0.5px',
    marginBottom: '2px'
  },

  featureDesc: {
    fontSize: '10px',
    color: '#666',
    letterSpacing: '0.5px'
  },

  statsBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '16px 20px',
    background: 'rgba(0, 255, 65, 0.04)',
    border: '1px solid rgba(0, 255, 65, 0.2)',
    borderRadius: '6px',
    marginBottom: '25px'
  },

  statItem: { flex: 1, textAlign: 'center' },

  statValue: {
    fontSize: '22px',
    color: '#00ff41',
    fontWeight: 700,
    textShadow: '0 0 10px rgba(0, 255, 65, 0.5)',
    lineHeight: 1,
    marginBottom: '4px'
  },

  statLabel: {
    fontSize: '9px',
    color: '#666',
    letterSpacing: '2px',
    fontWeight: 700
  },

  statDivider: {
    width: '1px',
    height: '30px',
    background: 'rgba(0, 255, 65, 0.2)'
  },

  bottomBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 14px',
    background: 'rgba(0, 255, 65, 0.05)',
    border: '1px solid rgba(0, 255, 65, 0.3)',
    borderRadius: '20px',
    fontSize: '10px',
    color: '#00ff41',
    letterSpacing: '2px',
    fontWeight: 700
  },

  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#00ff41',
    boxShadow: '0 0 6px #00ff41',
    animation: 'blink 1.5s infinite'
  },

  badgeSep: { color: '#333' },

  rightPanel: {
    flex: '1',
    position: 'relative',
    background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.6) 0%, rgba(5, 5, 5, 0.4) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    overflowY: 'auto',
    border: '1px solid rgba(0, 255, 65, 0.25)',
    borderRadius: '12px',
    boxShadow: '0 0 0 1px rgba(0, 255, 65, 0.1), 0 0 30px rgba(0, 255, 65, 0.15), 0 0 60px rgba(0, 255, 65, 0.08), inset 0 0 40px rgba(0, 255, 65, 0.03), inset 0 1px 0 rgba(0, 255, 65, 0.2)',
    backdropFilter: 'blur(10px)'
  },

  rightGrid: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'linear-gradient(rgba(0,255,65,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.02) 1px, transparent 1px)',
    backgroundSize: '30px 30px',
    pointerEvents: 'none',
    borderRadius: '12px'
  },

  formContainer: {
    width: '100%',
    maxWidth: '420px',
    position: 'relative',
    zIndex: 2
  },

  terminalBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 14px',
    background: 'rgba(0, 0, 0, 0.6)',
    border: '1px solid rgba(0, 255, 65, 0.2)',
    borderBottom: 'none',
    borderRadius: '4px 4px 0 0'
  },

  terminalDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%'
  },

  terminalTitle: {
    marginLeft: '10px',
    fontSize: '10px',
    color: '#666',
    letterSpacing: '1px'
  },

  tabs: {
    display: 'flex',
    gap: '2px',
    padding: '4px',
    background: 'rgba(0, 0, 0, 0.6)',
    border: '1px solid rgba(0, 255, 65, 0.2)',
    borderTop: 'none',
    marginBottom: '30px'
  },

  tab: {
    flex: 1,
    padding: '11px',
    background: 'transparent',
    border: 'none',
    color: '#666',
    fontFamily: 'monospace',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '2px',
    cursor: 'pointer',
    borderRadius: '3px',
    transition: 'all 0.2s ease'
  },

  tabActive: {
    background: 'rgba(0, 255, 65, 0.1)',
    color: '#00ff41',
    boxShadow: 'inset 0 0 10px rgba(0, 255, 65, 0.15)'
  },

  formHeader: { marginBottom: '26px' },

  formPrompt: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '10px',
    fontSize: '10px',
    fontFamily: 'monospace'
  },

  prompt: {
    color: '#00ff41',
    fontWeight: 700
  },

  formTag: {
    color: '#00ffff',
    letterSpacing: '1px'
  },

  cursor: {
    color: '#00ff41',
    animation: 'blink 1s infinite'
  },

  formTitle: {
    fontSize: '26px',
    color: '#e0e0e0',
    fontWeight: 700,
    margin: '0 0 8px',
    letterSpacing: '0.5px'
  },

  formSubtitle: {
    fontSize: '12px',
    color: '#666',
    letterSpacing: '0.5px',
    margin: 0,
    lineHeight: 1.5
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '22px'
  },

  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },

  label: {
    fontSize: '10px',
    color: '#888',
    letterSpacing: '2px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  inputWrapper: {
    position: 'relative',
    background: 'linear-gradient(135deg, #0a1a0f 0%, #050f0a 100%)',
    border: '1px solid rgba(0, 255, 65, 0.2)',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
    boxShadow: 'inset 0 0 15px rgba(0, 255, 65, 0.03)'
  },

  input: {
    width: '100%',
    padding: '13px 14px',
    background: 'transparent',
    border: 'none',
    color: '#00ff41',
    fontSize: '13px',
    fontFamily: 'monospace',
    outline: 'none',
    letterSpacing: '0.5px',
    caretColor: '#00ff41',
    textShadow: '0 0 4px rgba(0, 255, 65, 0.3)'
  },

  eyeBtn: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'transparent',
    border: 'none',
    color: '#666',
    cursor: 'pointer',
    padding: '4px 8px',
    display: 'flex',
    alignItems: 'center'
  },

  optionsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '-4px'
  },

  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '11px',
    color: '#888',
    cursor: 'pointer',
    fontFamily: 'monospace'
  },

  checkbox: {
    width: '14px',
    height: '14px',
    accentColor: '#00ff41',
    cursor: 'pointer'
  },

  forgotBtn: {
    background: 'none',
    border: 'none',
    color: '#00ffff',
    fontSize: '11px',
    cursor: 'pointer',
    fontFamily: 'monospace',
    letterSpacing: '0.5px',
    padding: 0
  },

  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    background: 'rgba(255, 0, 60, 0.08)',
    border: '1px solid rgba(255, 0, 60, 0.4)',
    borderLeft: '3px solid #ff003c',
    borderRadius: '4px',
    color: '#ff003c',
    fontSize: '11px',
    fontFamily: 'monospace'
  },

  successBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    background: 'rgba(0, 255, 65, 0.08)',
    border: '1px solid rgba(0, 255, 65, 0.4)',
    borderLeft: '3px solid #00ff41',
    borderRadius: '4px',
    color: '#00ff41',
    fontSize: '11px',
    fontFamily: 'monospace'
  },

  submitBtn: {
    padding: '14px',
    background: 'linear-gradient(135deg, rgba(0, 255, 65, 0.2) 0%, rgba(0, 255, 65, 0.05) 100%)',
    border: '1px solid #00ff41',
    color: '#00ff41',
    fontFamily: 'monospace',
    fontSize: '13px',
    fontWeight: 700,
    letterSpacing: '3px',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '6px',
    boxShadow: '0 0 20px rgba(0, 255, 65, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    position: 'relative',
    overflow: 'hidden'
  },

  spinner: {
    display: 'inline-block',
    animation: 'rotate 1s linear infinite'
  },

  arrowIcon: {
    fontSize: '16px',
    transition: 'transform 0.2s ease'
  },

  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '22px 0'
  },

  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'linear-gradient(90deg, transparent, #1a1a1a, transparent)'
  },

  dividerText: {
    fontSize: '9px',
    color: '#555',
    letterSpacing: '2px',
    fontWeight: 700,
    whiteSpace: 'nowrap'
  },

  socialButtons: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
    marginBottom: '22px'
  },

  socialBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '11px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid #1a1a1a',
    borderRadius: '4px',
    color: '#e0e0e0',
    fontFamily: 'monospace',
    fontSize: '11px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    letterSpacing: '0.5px'
  },

  terms: {
    fontSize: '10px',
    color: '#555',
    textAlign: 'center',
    letterSpacing: '0.5px',
    lineHeight: 1.6
  },

  termsLink: {
    color: '#00ffff',
    cursor: 'pointer'
  }
};