import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OAuthCallback() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { setAuthFromOAuth } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            setAuthFromOAuth(token);
            navigate('/', { replace: true });
        } else {
            navigate('/login', { replace: true });
        }
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-muted)',
        }}>
            Authenticating...
        </div>
    );
}
