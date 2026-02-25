import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiGithub, FiUser, FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';
import { getGoogleOAuthUrl, getGithubOAuthUrl } from '../api/auth';
import './LoginPage.css';

export default function LoginPage() {
    const [mode, setMode] = useState('login');
    const [form, setForm] = useState({ username: '', password: '', email: '' });
    const [error, setError] = useState('');
    const { login, register, loading } = useAuth();
    const navigate = useNavigate();
    const [infoMessage] = useState(() => {
        const msg = localStorage.getItem('threadly_info');
        if (msg) localStorage.removeItem('threadly_info');
        return msg || '';
    });

    function handleChange(e) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        try {
            if (mode === 'login') {
                await login(form.username, form.password);
                navigate('/');
            } else {
                await register({ username: form.username, email: form.email, password: form.password });
                await login(form.username, form.password);
                navigate('/');
            }
        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.');
        }
    }

    return (
        <div className="auth-page">
            {/* ── Left: Brand Panel ── */}
            <div className="auth-brand">
                <div className="auth-brand__orbs">
                    <div className="auth-brand__orb auth-brand__orb--1" />
                    <div className="auth-brand__orb auth-brand__orb--2" />
                    <div className="auth-brand__orb auth-brand__orb--3" />
                </div>
                <div className="auth-brand__content">
                    <img src="/Logo.png" alt="Threadly" className="auth-brand__logo" />
                    <h1 className="auth-brand__title">Threadly</h1>
                    <p className="auth-brand__tagline">
                        Where developers discuss, share, and grow together.
                    </p>
                    <div className="auth-brand__features">
                        <div className="auth-brand__feature">
                            <span className="auth-brand__feature-dot" />
                            Real-time discussions & threads
                        </div>
                        <div className="auth-brand__feature">
                            <span className="auth-brand__feature-dot" />
                            Follow developers you admire
                        </div>
                        <div className="auth-brand__feature">
                            <span className="auth-brand__feature-dot" />
                            Discover trending topics & tags
                        </div>
                    </div>
                </div>
                <div className="auth-brand__footer">
                    © 2026 Threadly · Built for developers
                </div>
            </div>

            {/* ── Right: Form Panel ── */}
            <div className="auth-form-panel">
                <div className="auth-form-wrap">
                    <div className="auth-form__header">
                        <h2 className="auth-form__title">
                            {mode === 'login' ? 'Welcome back' : 'Create your account'}
                        </h2>
                        <p className="auth-form__subtitle">
                            {mode === 'login'
                                ? 'Sign in to continue to Threadly'
                                : 'Join the developer community'}
                        </p>
                    </div>

                    {infoMessage && (
                        <div className="auth-info">{infoMessage}</div>
                    )}

                    {/* OAuth buttons first — prominent */}
                    <div className="auth-oauth">
                        <a href={getGoogleOAuthUrl()} className="auth-oauth__btn">
                            <FcGoogle />
                            <span>Google</span>
                        </a>
                        <a href={getGithubOAuthUrl()} className="auth-oauth__btn">
                            <FiGithub />
                            <span>GitHub</span>
                        </a>
                    </div>

                    <div className="auth-divider">
                        <span>or continue with email</span>
                    </div>

                    {error && <div className="auth-error">{error}</div>}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="auth-field">
                            <FiUser className="auth-field__icon" />
                            <input
                                id="username"
                                className="auth-field__input"
                                type="text"
                                name="username"
                                placeholder="Username"
                                value={form.username}
                                onChange={handleChange}
                                required
                                minLength={3}
                                maxLength={20}
                                autoComplete="username"
                            />
                        </div>

                        {mode === 'register' && (
                            <div className="auth-field">
                                <FiMail className="auth-field__icon" />
                                <input
                                    id="email"
                                    className="auth-field__input"
                                    type="email"
                                    name="email"
                                    placeholder="you@example.com"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        )}

                        <div className="auth-field">
                            <FiLock className="auth-field__icon" />
                            <input
                                id="password"
                                className="auth-field__input"
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={form.password}
                                onChange={handleChange}
                                required
                                minLength={5}
                                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                            />
                        </div>

                        <button
                            type="submit"
                            className="auth-submit"
                            disabled={loading}
                        >
                            <span>{loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                            {!loading && <FiArrowRight />}
                        </button>
                    </form>

                    <p className="auth-switch">
                        {mode === 'login' ? (
                            <>Don't have an account?{' '}
                                <button type="button" onClick={() => { setMode('register'); setError(''); }}>
                                    Sign Up
                                </button>
                            </>
                        ) : (
                            <>Already have an account?{' '}
                                <button type="button" onClick={() => { setMode('login'); setError(''); }}>
                                    Sign In
                                </button>
                            </>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
}
