import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { FiHome, FiTrendingUp, FiHash, FiUser, FiUsers } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { getTrendingTags } from '../../api/posts';
import TagChip from '../TagChip/TagChip';

const NAV_ITEMS = [
    { to: '/', icon: FiHome, label: 'Home Feed' },
    { to: '/following', icon: FiUsers, label: 'Following' },
    { to: '/trending', icon: FiTrendingUp, label: 'Trending' },
];

export default function Sidebar() {
    const { user } = useAuth();
    const [trendingTags, setTrendingTags] = useState([]);

    useEffect(() => {
        getTrendingTags(10)
            .then(tags => setTrendingTags(tags || []))
            .catch(() => setTrendingTags([]));
    }, []);

    return (
        <aside className="sidebar">
            <Link to="/" className="sidebar__brand">
                <img src="/Logo.png" alt="Threadly" className="sidebar__logo" />
                <span className="sidebar__app-name">Threadly</span>
            </Link>

            <nav className="sidebar__nav">
                <span className="sidebar__section-label">Navigate</span>
                {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/'}
                        className={({ isActive }) =>
                            `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                        }
                    >
                        <Icon className="sidebar__link-icon" />
                        <span>{label}</span>
                    </NavLink>
                ))}
                {user && (
                    <NavLink
                        to={`/user/${user.username}`}
                        className={({ isActive }) =>
                            `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                        }
                    >
                        <FiUser className="sidebar__link-icon" />
                        <span>My Profile</span>
                    </NavLink>
                )}

                {trendingTags.length > 0 && (
                    <>
                        <span className="sidebar__section-label">Trending Tags</span>
                        <div className="sidebar__tags">
                            {trendingTags.map(tag => (
                                <TagChip key={tag} label={tag} size="small" />
                            ))}
                        </div>
                    </>
                )}
            </nav>

            <div className="sidebar__footer">
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    Privacy Policy | Terms of Service
                    © 2026 Threadly
                </p>
            </div>
        </aside>
    );
}
