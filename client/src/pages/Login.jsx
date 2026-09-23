import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Lock, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, getDefaultRoute } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }
    try {
      setError('');
      setLoading(true);
      const user = await login(username, password);
      const targetRoute = getDefaultRoute(user.role);
      navigate(targetRoute, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid login credentials');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (u, p) => {
    setUsername(u);
    setPassword(p);
    setError('');
    setShowDemo(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 40%, #faf5ff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      padding: '16px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative blobs */}
      <div style={{
        position: 'absolute', top: '-80px', right: '-80px',
        width: '340px', height: '340px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '-100px', left: '-80px',
        width: '380px', height: '380px',
        background: 'radial-gradient(circle, rgba(168,85,247,0.10) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', top: '30%', left: '10%',
        width: '200px', height: '200px',
        background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
      }} />

      {/* Main Card */}
      <div style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '24px',
        boxShadow: '0 8px 32px rgba(99,102,241,0.12), 0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(255,255,255,0.6)',
        padding: '44px 40px',
        width: '100%',
        maxWidth: '420px',
        position: 'relative',
        zIndex: 1
      }}>

        {/* Logo + Title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img
            src="/assets/sm_groups_logo.png"
            alt="SM Groups"
            style={{ height: '52px', margin: '0 auto 16px', display: 'block', objectFit: 'contain' }}
          />
          <h1 style={{
            fontSize: '22px', fontWeight: '800', color: '#1e1b4b',
            margin: '0 0 6px', letterSpacing: '-0.4px'
          }}>
            Welcome Back
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0, fontWeight: '500' }}>
            Sign in to your workspace
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: '12px', padding: '10px 14px',
            display: 'flex', alignItems: 'center', gap: '8px',
            color: '#dc2626', fontSize: '12.5px', fontWeight: '500',
            marginBottom: '20px'
          }}>
            <AlertCircle style={{ width: '15px', height: '15px', flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block', fontSize: '11.5px', fontWeight: '700',
              color: '#374151', textTransform: 'uppercase', letterSpacing: '0.6px',
              marginBottom: '7px'
            }}>
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <User style={{
                position: 'absolute', left: '13px', top: '50%',
                transform: 'translateY(-50%)', width: '16px', height: '16px',
                color: '#9ca3af', pointerEvents: 'none'
              }} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                style={{
                  width: '100%', boxSizing: 'border-box',
                  paddingLeft: '40px', paddingRight: '14px',
                  paddingTop: '11px', paddingBottom: '11px',
                  background: '#f8fafc', border: '1.5px solid #e2e8f0',
                  borderRadius: '12px', fontSize: '14px', fontWeight: '500',
                  color: '#1e293b', outline: 'none', transition: 'all 0.2s',
                  fontFamily: 'inherit'
                }}
                onFocus={e => {
                  e.target.style.border = '1.5px solid #6366f1';
                  e.target.style.background = '#fff';
                  e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)';
                }}
                onBlur={e => {
                  e.target.style.border = '1.5px solid #e2e8f0';
                  e.target.style.background = '#f8fafc';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block', fontSize: '11.5px', fontWeight: '700',
              color: '#374151', textTransform: 'uppercase', letterSpacing: '0.6px',
              marginBottom: '7px'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock style={{
                position: 'absolute', left: '13px', top: '50%',
                transform: 'translateY(-50%)', width: '16px', height: '16px',
                color: '#9ca3af', pointerEvents: 'none'
              }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{
                  width: '100%', boxSizing: 'border-box',
                  paddingLeft: '40px', paddingRight: '42px',
                  paddingTop: '11px', paddingBottom: '11px',
                  background: '#f8fafc', border: '1.5px solid #e2e8f0',
                  borderRadius: '12px', fontSize: '14px', fontWeight: '500',
                  color: '#1e293b', outline: 'none', transition: 'all 0.2s',
                  fontFamily: 'inherit'
                }}
                onFocus={e => {
                  e.target.style.border = '1.5px solid #6366f1';
                  e.target.style.background = '#fff';
                  e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)';
                }}
                onBlur={e => {
                  e.target.style.border = '1.5px solid #e2e8f0';
                  e.target.style.background = '#f8fafc';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', cursor: 'pointer', color: '#9ca3af',
                  display: 'flex', alignItems: 'center', padding: '4px'
                }}
              >
                {showPassword
                  ? <EyeOff style={{ width: '16px', height: '16px' }} />
                  : <Eye style={{ width: '16px', height: '16px' }} />
                }
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '13px',
              background: loading
                ? '#a5b4fc'
                : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: '#fff', border: 'none', borderRadius: '13px',
              fontSize: '14.5px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: loading ? 'none' : '0 4px 15px rgba(99,102,241,0.35)',
              transition: 'all 0.2s', letterSpacing: '0.2px',
              fontFamily: 'inherit'
            }}
            onMouseEnter={e => {
              if (!loading) {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 6px 20px rgba(99,102,241,0.45)';
              }
            }}
            onMouseLeave={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = loading ? 'none' : '0 4px 15px rgba(99,102,241,0.35)';
            }}
          >
            {loading ? (
              <div style={{
                width: '18px', height: '18px',
                border: '2.5px solid rgba(255,255,255,0.4)',
                borderTop: '2.5px solid #fff',
                borderRadius: '50%',
                animation: 'spin 0.7s linear infinite'
              }} />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight style={{ width: '17px', height: '17px' }} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p style={{
          textAlign: 'center', marginTop: '28px',
          fontSize: '11.5px', color: '#94a3b8', fontWeight: '500'
        }}>
          © 2026 THE SM GROUPS · TN Skills Internship Portal
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #c0ccda; }
      `}</style>
    </div>
  );
};

export default Login;
