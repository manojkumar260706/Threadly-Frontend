import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { login as apiLogin, register as apiRegister } from '../api/auth';
import { getUserProfile } from '../api/users';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('threadly_token'));
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('threadly_user');
        return stored ? JSON.parse(stored) : null;
    });
    const [loading, setLoading] = useState(false);

    const isAuthenticated = !!token;

    const logoutTimerRef = useRef(null);

    function decodeToken(jwt) {
        try {
            const payload = JSON.parse(atob(jwt.split('.')[1]));
            return {
                username: payload.sub || payload.username || 'user',
                email: payload.email || '',
                id: payload.id || payload.userId || null,
            };
        } catch {
            return { username: 'user', email: '', id: null };
        }
    }

    function getTokenExpiry(jwt) {
        try {
            const payload = JSON.parse(atob(jwt.split('.')[1]));
            return payload.exp ? payload.exp * 1000 : null; // convert to ms
        } catch {
            return null;
        }
    }

    function isTokenExpired(jwt) {
        const expiry = getTokenExpiry(jwt);
        if (!expiry) return false; // no exp claim, can't determine
        return Date.now() >= expiry;
    }

    // Schedule auto-logout when token expires
    function scheduleAutoLogout(jwt) {
        // Clear any existing timer
        if (logoutTimerRef.current) {
            clearTimeout(logoutTimerRef.current);
            logoutTimerRef.current = null;
        }

        const expiry = getTokenExpiry(jwt);
        if (!expiry) return;

        const msUntilExpiry = expiry - Date.now();
        if (msUntilExpiry <= 0) return; // already expired

        logoutTimerRef.current = setTimeout(() => {
            console.log('JWT expired — logging out automatically');
            localStorage.removeItem('threadly_token');
            localStorage.removeItem('threadly_user');
            setToken(null);
            setUser(null);
            window.location.href = '/login';
        }, msUntilExpiry);
    }

    // Fetch full profile (including profileImageUrl) from API
    async function fetchFullProfile(username) {
        try {
            const profile = await getUserProfile(username);
            const enriched = (prev) => {
                const updated = {
                    ...prev,
                    profileImageUrl: profile.profileImageUrl || '',
                    bio: profile.bio || '',
                };
                localStorage.setItem('threadly_user', JSON.stringify(updated));
                return updated;
            };
            setUser(enriched);
        } catch (err) {
            console.error('Failed to fetch profile:', err);
        }
    }

    // Check token expiry on mount and whenever token changes
    useEffect(() => {
        if (token) {
            // If token is already expired, logout immediately
            if (isTokenExpired(token)) {
                console.log('Stored JWT is expired — logging out');
                localStorage.removeItem('threadly_token');
                localStorage.removeItem('threadly_user');
                setToken(null);
                setUser(null);
                return;
            }

            // Token is valid — schedule auto-logout
            scheduleAutoLogout(token);

            if (!user) {
                const decoded = decodeToken(token);
                setUser(decoded);
                localStorage.setItem('threadly_user', JSON.stringify(decoded));
                fetchFullProfile(decoded.username);
            } else if (user.profileImageUrl === undefined) {
                // Existing session but no profile pic loaded yet
                fetchFullProfile(user.username);
            }
        }

        // Cleanup timer on unmount or token change
        return () => {
            if (logoutTimerRef.current) {
                clearTimeout(logoutTimerRef.current);
            }
        };
    }, [token]);

    const login = useCallback(async (username, password) => {
        setLoading(true);
        try {
            const jwt = await apiLogin(username, password);
            const cleanToken = jwt.replace(/^"|"$/g, '');
            localStorage.setItem('threadly_token', cleanToken);
            setToken(cleanToken);
            const decoded = decodeToken(cleanToken);
            setUser(decoded);
            localStorage.setItem('threadly_user', JSON.stringify(decoded));
            fetchFullProfile(decoded.username);
            return decoded;
        } finally {
            setLoading(false);
        }
    }, []);

    const register = useCallback(async (data) => {
        setLoading(true);
        try {
            await apiRegister(data);
            return true;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('threadly_token');
        localStorage.removeItem('threadly_user');
        setToken(null);
        setUser(null);
    }, []);

    const setAuthFromOAuth = useCallback((jwt) => {
        const cleanToken = jwt.replace(/^"|"$/g, '');
        localStorage.setItem('threadly_token', cleanToken);
        setToken(cleanToken);
        const decoded = decodeToken(cleanToken);
        setUser(decoded);
        localStorage.setItem('threadly_user', JSON.stringify(decoded));
        fetchFullProfile(decoded.username);
    }, []);

    // Allow components to refresh profile data (e.g. after editing)
    const refreshProfile = useCallback(() => {
        if (user?.username) fetchFullProfile(user.username);
    }, [user?.username]);

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isAuthenticated,
            loading,
            login,
            register,
            logout,
            setAuthFromOAuth,
            refreshProfile,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
