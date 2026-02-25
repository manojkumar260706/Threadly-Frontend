import { useState, useEffect } from 'react';
import { getNotifications } from '../../api/notifications';
import { formatRelativeTime } from '../../utils/time';
import './NotificationDropdown.css';

export default function NotificationDropdown() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await getNotifications();
                setNotifications(data || []);
            } catch {
                setNotifications([]);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    return (
        <div className="notification-dropdown">
            <div className="notification-dropdown__header">
                <span>Notifications</span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    {notifications.length} total
                </span>
            </div>

            {loading && (
                <div className="notification-dropdown__empty">Loading...</div>
            )}

            {!loading && notifications.length === 0 && (
                <div className="notification-dropdown__empty">
                    No notifications yet ✨
                </div>
            )}

            {notifications.map(n => (
                <div
                    key={n.id}
                    className={`notification-item ${!n.read ? 'notification-item--unread' : ''}`}
                >
                    <p className="notification-item__message">{n.message}</p>
                    <p className="notification-item__time">{formatRelativeTime(n.createdAt)}</p>
                </div>
            ))}
        </div>
    );
}
