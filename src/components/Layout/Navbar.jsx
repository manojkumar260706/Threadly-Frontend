import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiPlus, FiBell, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import NotificationDropdown from '../NotificationDropdown/NotificationDropdown';

export default function Navbar({ onMenuToggle }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef(null);
    const notifRef = useRef(null);

    useEffect(() => {
        function handleClick(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setShowNotifications(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    function handleLogout() {
        logout();
        navigate('/login');
    }

    function handleSearch(e) {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    }

    const initial = user?.username?.charAt(0) || 'U';

    return (
        <header className="navbar">
            <button className="mobile-menu-btn" onClick={onMenuToggle}>
                ☰
            </button>

            <form className="navbar__search" onSubmit={handleSearch}>
                <FiSearch className="navbar__search-icon" />
                <input
                    id="global-search"
                    className="navbar__search-input"
                    type="text"
                    placeholder="Search threads, tags, people..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
            </form>

            <div className="navbar__actions">
                <ThemeToggle />

                <Link to="/create" className="navbar__create-btn" id="create-post-btn">
                    <FiPlus />
                    <span>New Thread</span>
                </Link>

                <div ref={notifRef} style={{ position: 'relative' }}>
                    <button
                        className="navbar__icon-btn"
                        id="notification-bell"
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        <FiBell />
                        <span className="badge" />
                    </button>
                    {showNotifications && <NotificationDropdown />}
                </div>

                <div ref={dropdownRef} className="navbar__avatar-btn" onClick={() => setShowDropdown(!showDropdown)}>
                    <div className="navbar__avatar">
                        {user?.profileImageUrl ? (
                            <img src={user.profileImageUrl} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                        ) : (
                            initial
                        )}
                    </div>

                    {showDropdown && (
                        <div className="avatar-dropdown">
                            <div style={{ padding: 'var(--space-3)', borderBottom: 'var(--border)' }}>
                                <p style={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-sm)' }}>{user?.username}</p>
                                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{user?.email}</p>
                            </div>
                            <Link to={`/user/${user?.username}`} className="avatar-dropdown__item" onClick={() => setShowDropdown(false)}>
                                <FiUser /> My Profile
                            </Link>
                            <button className="avatar-dropdown__item" onClick={() => setShowDropdown(false)}>
                                <FiSettings /> Settings
                            </button>
                            <div className="avatar-dropdown__divider" />
                            <button className="avatar-dropdown__item avatar-dropdown__item--danger" onClick={handleLogout}>
                                <FiLogOut /> Log out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
